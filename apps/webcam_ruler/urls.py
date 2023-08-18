from django.urls import path

from .views import index_view, details_view, app_view


urlpatterns = [
    path('', index_view, name='webcam-ruler'),
    path('details', details_view, name='webcam-ruler-details'),
    path('app', app_view, name='webcam-ruler-app'),
]
