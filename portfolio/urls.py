"""
URL configuration for portfolio project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin

from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("__debug__/", include("debug_toolbar.urls")),
    path('old_main/', include('apps.main.urls')),
    path('', include('apps.new_main.urls')),
    path('projects/voice_stripper/', include('apps.voice_stripper.urls')),
    path('projects/eliza_parser/', include('apps.eliza_parser.urls')),
    path('projects/web_soundboard/', include('apps.web_soundboard.urls')),
    path('projects/chat_highlights/', include('apps.chat_highlights.urls')),
    path('projects/magic_eye/', include('apps.magic_eye.urls')),
    path('projects/whistle_detector/', include('apps.whistle_detector.urls')),
    path('projects/morse_code/', include('apps.morse_code.urls')),
    path('projects/webcam_ruler/', include('apps.webcam_ruler.urls')),
    path('projects/speech_transcriber/', include('apps.speech_transcriber.urls'))
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler404 = 'apps.main.views.not_found_view'

