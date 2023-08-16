from django.urls import path

from .views import index_view, about_view, app_view


urlpatterns = [
    path('', index_view, name='webcam-ruler'),
    path('about', about_view, name='webcam-ruler-about'),
    path('app', app_view, name='webcam-ruler-app'),
]
