from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse
from django.shortcuts import render

from apps.main.models import Post


def favicon(_):
    favicon_path = staticfiles_storage.path('images/favicon.png')
    with open(favicon_path, 'rb') as favicon_img:
        return HttpResponse(favicon_img.read(), content_type="image/png")


def main_view(request):
    return render(request, 'new_main/index.html')


def about_view(request):
    return render(request, 'new_main/about.html')


def projects_view(request):
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/projects.html', context={'projects': project_list})


def blogs_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    return render(request, 'new_main/blogs.html', context={'blogs': blog_list})


def cv_view(_):
    cv_path = staticfiles_storage.path('resources/KanKawabataCV.pdf')
    with open(cv_path, 'rb') as pdf:
        response = HttpResponse(pdf.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'filename=KanKawabata_CV.pdf'
        return response
