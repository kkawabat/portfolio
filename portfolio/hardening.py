"""Production safety checks and cheap in-process abuse guards.

Cloud Run is public (allUsers). The views that spend money or a worker
(AWS Transcribe, yt-dlp, chat scrape) have no login, so the only backstop
is a per-IP ceiling plus a hard reject of DEBUG/insecure secrets at boot.
The limiter uses Django's locmem cache: two instances can each admit a
full quota, which is still far below an unbounded Transcribe loop.
"""

from __future__ import annotations

from functools import wraps
from typing import Callable

from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest, HttpResponse, JsonResponse

_PERIODS = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}

# Audio demos record a few seconds of mic; 4 MiB is generous for webm/opus.
MAX_AUDIO_BYTES = 4 * 1024 * 1024
MAX_IMAGE_BYTES = 8 * 1024 * 1024


def assert_cloud_run_safe(environ: dict, *, debug: bool, secret_key: str) -> None:
    """Refuse to boot a public service with DEBUG or the committed fallback key."""
    if not environ.get('K_SERVICE'):
        return
    if debug:
        raise ImproperlyConfigured('DJANGO_DEBUG must be False on Cloud Run')
    if not environ.get('DJANGO_SECRET_KEY') or secret_key.startswith('django-insecure-'):
        raise ImproperlyConfigured('DJANGO_SECRET_KEY must be set on Cloud Run')


def client_ip(request: HttpRequest) -> str:
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if forwarded:
        return forwarded.split(',')[-1].strip() or 'unknown'
    return request.META.get('REMOTE_ADDR') or 'unknown'


def parse_rate(rate: str) -> tuple[int, int]:
    count, unit = rate.split('/')
    return int(count), _PERIODS[unit]


def ratelimit(rate: str, *, json_error: bool = True) -> Callable:
    """Allow `count` hits per IP per window on a view (`'3/h'`, `'20/m'`)."""

    limit, timeout = parse_rate(rate)

    def decorator(view: Callable) -> Callable:
        @wraps(view)
        def wrapped(request: HttpRequest, *args, **kwargs):
            key = f'rl:{view.__module__}.{view.__qualname__}:{client_ip(request)}'
            if cache.add(key, 1, timeout):
                hits = 1
            else:
                try:
                    hits = cache.incr(key)
                except ValueError:
                    cache.set(key, 1, timeout)
                    hits = 1
            if hits > limit:
                return _too_many(request, timeout, json_error)
            return view(request, *args, **kwargs)

        return wrapped

    return decorator


def limit_body(max_bytes: int, *, json_error: bool = True) -> Callable:
    def decorator(view: Callable) -> Callable:
        @wraps(view)
        def wrapped(request: HttpRequest, *args, **kwargs):
            try:
                length = int(request.META.get('CONTENT_LENGTH') or 0)
            except ValueError:
                length = 0
            if length > max_bytes:
                return _too_large(request, json_error)
            return view(request, *args, **kwargs)

        return wrapped

    return decorator


def _too_many(request: HttpRequest, retry_after: int, json_error: bool) -> HttpResponse:
    if json_error:
        response = JsonResponse(
            {'error': 'Too many requests. Please wait before trying again.'},
            status=429,
        )
    else:
        response = HttpResponse(
            'Too many requests. Please wait before trying again.',
            status=429,
            content_type='text/plain; charset=utf-8',
        )
    response['Retry-After'] = str(retry_after)
    return response


def _too_large(request: HttpRequest, json_error: bool) -> HttpResponse:
    if json_error:
        return JsonResponse({'error': 'Request too large.'}, status=413)
    return HttpResponse('Request too large.', status=413, content_type='text/plain; charset=utf-8')
