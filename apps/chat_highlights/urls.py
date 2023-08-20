from django.urls import path

from .views import details_view, app_view, index_view

urlpatterns = [
    path('', index_view, name='chat-highlight'),
    path('details', details_view, name='chat-highlight-details'),
    path('app', app_view, name='chat-highlight-app')
]
