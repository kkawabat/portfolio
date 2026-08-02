from django.urls import path

from .views import index_view, details_view, app_view


urlpatterns = [
    path('', index_view, name='you-laugh-you-lose'),
    path('details', details_view, name='you-laugh-you-lose-details'),
    path('app', app_view, name='you-laugh-you-lose-app'),
]
