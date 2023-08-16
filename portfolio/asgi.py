"""
ASGI config for portfolio project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

import django
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import apps.webcam_ruler.routing
import apps.morse_code.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')

django.setup()

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.morse_code.routing.websocket_urlpatterns +
            apps.webcam_ruler.routing.websocket_urlpatterns
        )
    ),
})
