from django.urls import path

from .views import main_view, cv_view, post_request_view, about_view, favicon

urlpatterns = [
    path('', main_view, name='new_main'),
    path('favicon.ico', favicon, name='favicon'),
    path('cv', cv_view, name='cv'),
    path('about', about_view, name='about'),
    path('post_request', post_request_view, name='post_request'),
]
