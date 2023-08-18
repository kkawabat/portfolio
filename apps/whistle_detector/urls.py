from django.urls import path

from .views import whistle_detector_view, whistle_submit_view, details_view, app_view

urlpatterns = [
    path('', whistle_detector_view, name='whistle-detector'),
    path('submit', whistle_submit_view, name='whistle-detector-submit'),
    path('details', details_view, name='whistle-detector-details'),
    path('app', app_view, name='whistle-detector-app'),
]
