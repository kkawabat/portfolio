from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/cam_distance_signaling/', consumers.CamHandshake.as_asgi())
]
