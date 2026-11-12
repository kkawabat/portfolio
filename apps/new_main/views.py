from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render, redirect
from django.urls import NoReverseMatch, reverse
from django.utils.cache import patch_vary_headers
from django.conf import settings
import mistune
import os
import re

from .projects_config import (
    format_blog_date_display,
    get_blog_posts_dir,
    get_blogs,
    get_hosted_projects,
    get_project_tags,
    get_projects,
    parse_blog_dates,
    strip_blog_date_lines,
)


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

    dates = parse_blog_dates(text)
    text = strip_blog_date_lines(text)

    # The H1 is the page title (already in blog['title']); don't render it twice
    text = re.sub(r'^#\s+.+\n?', '', text.lstrip(), count=1)

    post = {'title': blog['title'],
            'description': blog['description'],
            'date': format_blog_date_display(dates),
            'content': mistune.html(text)}

    # Clicking a card swaps just the post into the open homepage; visiting the
    # URL directly (a shared link, a search result) gets the whole page.
    if request.headers.get('HX-Request'):
        response = render(request, 'new_main/blog_post.html', context=post)
    else:
        response = render(request, 'new_main/index.html',
                          context={**_homepage_context('blogs'), 'open_post': post})
    patch_vary_headers(response, ['HX-Request'])
    return response


def robots_txt(_):
    return HttpResponse(
        f"User-agent: *\nAllow: /\n\nSitemap: {settings.CANONICAL_ORIGIN}{reverse('sitemap')}\n",
        content_type='text/plain',
    )


def sitemap_xml(request):
    pages = [{'path': reverse('new_main'), 'lastmod': None}]
    pages += [{'path': reverse('blog_post', args=[blog['slug']]),
               'lastmod': blog.get('updated') or blog.get('date')}
              for blog in get_blogs()]
    pages += [{'path': project['root_url'], 'lastmod': None} for project in get_hosted_projects()]
    return render(request, 'new_main/sitemap.xml', {'pages': pages},
                  content_type='application/xml')


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
