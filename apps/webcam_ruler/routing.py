from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/webcam_ruler_signaling/', consumers.CamHandshake.as_asgi())
]
