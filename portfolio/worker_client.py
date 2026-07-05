import logging
from urllib.parse import urlparse

import google.auth.transport.requests
import google.oauth2.id_token
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def worker_available() -> bool:
    return bool(getattr(settings, 'WORKER_SERVICE_URL', None))


def _is_local_worker(url: str) -> bool:
    host = urlparse(url).hostname or ''
    return host in ('localhost', '127.0.0.1')


def _auth_headers(worker_url: str) -> dict:
    if _is_local_worker(worker_url):
        return {}
    token = google.oauth2.id_token.fetch_id_token(
        google.auth.transport.requests.Request(),
        worker_url.rstrip('/'),
    )
    return {'Authorization': f'Bearer {token}'}


def call_worker(path: str, payload: dict, timeout: int = 290) -> dict:
    base = settings.WORKER_SERVICE_URL.rstrip('/')
    response = requests.post(
        f'{base}{path}',
        json=payload,
        headers={**_auth_headers(base), 'Content-Type': 'application/json'},
        timeout=timeout,
    )
    if response.status_code == 400:
        return response.json()
    response.raise_for_status()
    return response.json()
