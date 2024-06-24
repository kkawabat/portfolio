from django.urls import path

from .views import details_view, app_view, index_view, strip_vocal

urlpatterns = [
    path('', index_view, name='voice-stripper'),
    path('details', details_view, name='voice-stripper-detail'),
    path('app', app_view, name='voice-stripper-app'),
    path('strip', strip_vocal, name='voice-stripper-strip'),

]
