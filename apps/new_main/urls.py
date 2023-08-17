from django.urls import path

from .views import main_view, contacts_view, projects_view, about_view, favicon, blogs_view, cv_pdf, blog_post_view, project_post_view, socials_view

urlpatterns = [
    path('', main_view, name='new_main'),
    path('favicon.ico', favicon, name='favicon'),
    path('about', about_view, name='about'),

    path('projects', projects_view, name='projects'),
    path('project_get/<slug:slug_id>', project_post_view, name='project_post'),
    path('blogs', blogs_view, name='blogs'),
    path('blogs/<slug:slug_id>', blog_post_view, name='blog_post'),
    path('socials', socials_view, name='socials'),
    path('contacts', contacts_view, name='contacts'),
    path('cv.pdf', cv_pdf, name='cv_pdf'),
]
