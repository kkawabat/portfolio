from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse

from apps.main.models import Post


def favicon(_):
    favicon_path = staticfiles_storage.path('images/favicon.png')
    with open(favicon_path, 'rb') as favicon_img:
        return HttpResponse(favicon_img.read(), content_type="image/png")


def main_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           })


def about_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'about'})


def projects_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'projects'})


def blogs_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'blogs'})


def blog_post_view(request, slug_id):
    blog = Post.objects.get(slug=slug_id)
    if slug_id.startswith('how-to-get-started-on-web'):
        return render(request, 'blog_posts/How to get started on web development for layman.html', context={'blog': blog})
    return render(request, 'new_main/blog_post.html', context={'blog': blog})


def contacts_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'contacts'})


def cv_pdf(_):
    cv_path = staticfiles_storage.path('resources/KanKawabataCV.pdf')
    with open(cv_path, 'rb') as pdf:
        response = HttpResponse(pdf.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'filename=KanKawabata_CV.pdf'
        return response


def project_post_view(_, slug_id):
    if slug_id.startswith('webcam-ruler'):
        return redirect('webcam-ruler')
    elif slug_id.startswith('magic-eye'):
        return redirect('magic-eye')
    elif slug_id.startswith('morse-code'):
        return redirect('morse-code')
    elif slug_id.startswith('whistle-detector'):
        return redirect('whistle-detector')
    elif slug_id.startswith('web-soundboard'):
        return redirect('web-soundboard')


def socials_view(request):
    blog_list = Post.objects.filter(status=1, content_type=0).order_by('-created_on')
    project_list = Post.objects.filter(status=1, content_type=1).order_by('-created_on')
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'socials'})
