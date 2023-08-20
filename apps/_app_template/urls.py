from django.urls import path

from .views import details_view, app_view, index_view

urlpatterns = [
    path('', index_view, name='app-name'),
    path('details', details_view, name='app-name-details'),
    path('app', app_view, name='app-name-app')
]
