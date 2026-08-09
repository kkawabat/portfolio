from django.conf import settings


def build_info(_request):
    """Exposes the commit and build time stamped into the image by CI."""
    return {
        'build_sha': settings.BUILD_SHA,
        'build_time': settings.BUILD_TIME,
    }
