from django.conf import settings

from .projects_config import get_hosted_projects


def build_info(_request):
    """Exposes the commit and build time stamped into the image by CI."""
    return {
        'build_sha': settings.BUILD_SHA,
        'build_time': settings.BUILD_TIME,
    }


def canonical_origin(_request):
    return {'canonical_origin': settings.CANONICAL_ORIGIN}


def current_project(request):
    """A demo's sub-routes (/details, /listen, ...) all render the demo's one page."""
    for project in get_hosted_projects():
        if request.path.startswith(project['root_url']):
            return {'current_project': project}
    return {}
