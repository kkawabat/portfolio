from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from .models import Post


def main_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'main/index.html', context={'blogs': blog_list,
                                                       'projects': project_list})


def cv_view(_):
    cv_path = staticfiles_storage.path('resources/KanKawabataCV.pdf')
    with open(cv_path, 'rb') as pdf:
        response = HttpResponse(pdf.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'filename=KanKawabata_CV.pdf'
        return response


def post_request_view(request):
    post_slug = request.GET.get('post_slug', None)
    post = Post.objects.get(slug=post_slug)
    if post_slug == "magic-eye-generator":
        html = render_to_string('magic_eye/magic_eye.html', context={'post': post}, request=request)
    elif post_slug == "whistle-detector":
        html = render_to_string('whistle_detector/whistle_detector.html', context={'post': post}, request=request)
    else:
        html = render_to_string('post.html', context={'post': post}, request=request)
    return JsonResponse(html, safe=False)


def not_found_view(request, exception):
    response = render(request, '404.html')
    response.status_code = 404  # see https://stackoverflow.com/a/35800356
    return response
