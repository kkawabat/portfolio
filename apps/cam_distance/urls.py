from django.urls import path

from .views import cam_distance_app_view


urlpatterns = [
    path('', cam_distance_app_view, name='cam-distance'),
]
