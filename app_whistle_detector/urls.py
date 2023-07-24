from django.urls import path

from app_whistle_detector.views import whistle_detector_view, whistle_submit_view

urlpatterns = [
    path('whistle_detector', whistle_detector_view, name='whistle_detector'),
    path('submit', whistle_submit_view, name='submit')
]
