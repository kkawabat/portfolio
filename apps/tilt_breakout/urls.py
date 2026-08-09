from django.urls import path

from .views import index_view, details_view, app_view


urlpatterns = [
    path('', index_view, name='tilt-breakout'),
    path('details', details_view, name='tilt-breakout-details'),
    path('app', app_view, name='tilt-breakout-app'),
]
