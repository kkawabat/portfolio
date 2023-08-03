from django.urls import path

from app_cam_distance.views import cam_distance_app_view


urlpatterns = [
    path('', cam_distance_app_view, name='cam_distance_main'),
]
