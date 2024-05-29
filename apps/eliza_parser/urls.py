from django.urls import path

from .views import details_view, app_view, index_view

urlpatterns = [
    path('', index_view, name='eliza-parser'),
    path('details', details_view, name='eliza-parser-detail'),
    path('app', app_view, name='eliza-parser-app')
]
