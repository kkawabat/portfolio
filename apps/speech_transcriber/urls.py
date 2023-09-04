from django.urls import path

from .views import details_view, app_view, index_view

urlpatterns = [
    path('', index_view, name='speech-transcriber'),
    path('details', details_view, name='speech-transcriber-detail'),
    path('app', app_view, name='speech-transcriber-app')
]
