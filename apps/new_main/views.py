from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render, redirect
from django.urls import NoReverseMatch
from django.conf import settings
import mistune
import os
import re

from .projects_config import get_projects, get_blogs, get_blog_posts_dir, get_project_tags


def _homepage_context(anchor=None):
    context = {
        'blogs': get_blogs(),
        'projects': get_projects(),
        'project_tags': get_project_tags(),
    }
    if anchor:
        context['anchor'] = anchor
    return context


def favicon(_):
    favicon_path = staticfiles_storage.path('images/favicon.png')
    with open(favicon_path, 'rb') as favicon_img:
        return HttpResponse(favicon_img.read(), content_type="image/png")


def main_view(request):
    return render(request, 'new_main/index.html', context=_homepage_context())


def about_view(request):
    return render(request, 'new_main/index.html', context=_homepage_context('about'))


def projects_view(request):
    return render(request, 'new_main/index.html', context=_homepage_context('projects'))


def blogs_view(request):
    return render(request, 'new_main/index.html', context=_homepage_context('blogs'))


def blog_post_view(request, slug_id):
    """Render a markdown blog post from the blog_posts folder."""
    blog = next((b for b in get_blogs() if b['slug'] == slug_id), None)
    if not blog:
        return HttpResponseNotFound(f"Blog post '{slug_id}' not found")

    blog_posts_dir = get_blog_posts_dir()
    with open(os.path.join(blog_posts_dir, blog['filename']), encoding='utf-8') as f:
        text = f.read()

    # Pull out the "| Aug 15, 2023" date line so it can be styled
    date = ''
    date_match = re.search(r'^\|\s*(.+?)\s*$', text, re.MULTILINE)
    if date_match:
        date = date_match.group(1)
        text = text.replace(date_match.group(0), '', 1)

    # The H1 is the page title (already in blog['title']); don't render it twice
    text = re.sub(r'^#\s+.+\n?', '', text.lstrip(), count=1)

    return render(request, 'new_main/blog_post.html',
                  context={'title': blog['title'],
                           'date': date,
                           'content': mistune.html(text)})


def contacts_view(request):
    return render(request, 'new_main/index.html', context=_homepage_context('contacts'))


def cv_pdf(_):
    cv_path = staticfiles_storage.path('resources/KanKawabataCV.pdf')
    with open(cv_path, 'rb') as pdf:
        response = HttpResponse(pdf.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'filename=KanKawabata_CV.pdf'
        return response


def project_post_view(_, slug_id):
    for project in get_projects():
        if project['slug'] == slug_id and project.get('url'):
            return redirect(project['url'])
    try:
        return redirect(slug_id)
    except NoReverseMatch:
        return HttpResponseNotFound(f"No project with id {slug_id} found")


def socials_view(request):
    return render(request, 'new_main/index.html', context=_homepage_context('socials'))
