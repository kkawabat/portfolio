from django.urls import path

from .views import main_view, cv_view, projects_view, about_view, favicon, blogs_view, cv_pdf

urlpatterns = [
    path('', main_view, name='new_main'),
    path('favicon.ico', favicon, name='favicon'),
    path('about', about_view, name='about'),
    path('projects', projects_view, name='projects'),
    path('blogs', blogs_view, name='blogs'),
    path('cv', cv_view, name='cv'),
    path('cv.pdf', cv_pdf, name='cv_pdf'),
]
