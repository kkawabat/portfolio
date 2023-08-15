from django.urls import path

from .views import main_view, cv_view, projects_view, about_view, favicon, blogs_view, cv_pdf, blog_post_view, project_post_view

urlpatterns = [
    path('', main_view, name='new_main'),
    path('favicon.ico', favicon, name='favicon'),
    path('about', about_view, name='about'),
    path('projects', projects_view, name='projects'),
    path('project/<slug:slug_id>', project_post_view, name='project_post'),
    path('blogs', blogs_view, name='blogs'),
    path('blog/<slug:slug_id>', blog_post_view, name='blog_post'),
    path('cv', cv_view, name='cv'),
    path('cv.pdf', cv_pdf, name='cv_pdf'),
]
