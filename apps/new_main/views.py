from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render, redirect
from django.urls import NoReverseMatch
from django.conf import settings
import mistune
import os
import re

from .projects_config import get_projects, get_blogs, get_blog_posts_dir


def favicon(_):
    favicon_path = staticfiles_storage.path('images/favicon.png')
    with open(favicon_path, 'rb') as favicon_img:
        return HttpResponse(favicon_img.read(), content_type="image/png")


def main_view(request):
    blog_list = get_blogs()
    project_list = get_projects()
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list})


def about_view(request):
    blog_list = get_blogs()
    project_list = get_projects()
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'about'})


def projects_view(request):
    blog_list = get_blogs()
    project_list = get_projects()
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'projects'})


def blogs_view(request):
    blog_list = get_blogs()
    project_list = get_projects()
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'blogs'})


def blog_post_view(request, slug_id):
    """Render a markdown blog post from the blog_posts folder."""
    # Convert slug back to filename
    filename = slug_id.replace('-', ' ') + '.md'

    blog_posts_dir = get_blog_posts_dir()

    # Try to find the file (case insensitive)
    for file in os.listdir(blog_posts_dir):
        if file.lower() == filename.lower():
            with open(os.path.join(blog_posts_dir, file), encoding='utf-8') as f:
                text = f.read()

            # Pull out the "| Aug 15, 2023" date line so it can be styled
            date = ''
            date_match = re.search(r'^\|\s*(.+?)\s*$', text, re.MULTILINE)
            if date_match:
                date = date_match.group(1)
                text = text.replace(date_match.group(0), '', 1)

            return render(request, 'new_main/blog_post.html',
                          context={'title': file[:-len('.md')],
                                   'date': date,
                                   'content': mistune.html(text)})

    return HttpResponseNotFound(f"Blog post '{slug_id}' not found")


def contacts_view(request):
    blog_list = get_blogs()
    project_list = get_projects()
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
    try:
        return redirect(slug_id)
    except NoReverseMatch:
        return HttpResponseNotFound(f"No project with id {slug_id} found")


def socials_view(request):
    blog_list = get_blogs()
    project_list = get_projects()
    return render(request, 'new_main/index.html', context={'blogs': blog_list,
                                                           'projects': project_list,
                                                           'anchor': 'socials'})
