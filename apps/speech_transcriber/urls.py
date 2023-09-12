from django.urls import path

from .views import details_view, app_view, index_view, submit_audio, sample_transcript_view

urlpatterns = [
    path('', index_view, name='speech-transcriber'),
    path('details', details_view, name='speech-transcriber-detail'),
    path('app', app_view, name='speech-transcriber-app'),
    path('submit', submit_audio, name='speech-transcriber-submit'),
    path('sample_transcript', sample_transcript_view, name='speech-transcriber-transcript_view'),
]
