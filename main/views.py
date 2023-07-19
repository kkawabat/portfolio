from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from main.models import Post


def main_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'index.html', context={'blogs': blog_list,
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
    html = render_to_string('post.html', {'post': post})
    return JsonResponse(html, safe=False)


def zach_view(request):
    return render(request, 'donot.html')
