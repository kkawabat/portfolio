from django.urls import path

from .views import whistle_detector_view, whistle_submit_view

urlpatterns = [
    path('', whistle_detector_view, name='whistle_detector'),
    path('submit', whistle_submit_view, name='submit')
]
