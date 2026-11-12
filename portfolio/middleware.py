from django.conf import settings
from django.http import HttpResponsePermanentRedirect


class WwwToCanonicalHostMiddleware:
    """Search engines index www and the bare domain as two separate sites."""

    def __init__(self, get_response):
        self.get_response = get_response
        self.www_host = 'www.' + settings.CANONICAL_ORIGIN.split('://', 1)[1]

    def __call__(self, request):
        if request.get_host() == self.www_host:
            return HttpResponsePermanentRedirect(
                settings.CANONICAL_ORIGIN + request.get_full_path()
            )
        return self.get_response(request)
