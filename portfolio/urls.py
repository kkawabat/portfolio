from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.new_main.urls')),
    path('projects/voice_stripper/', include('apps.voice_stripper.urls')),
    path('projects/eliza_parser/', include('apps.eliza_parser.urls')),
    path('projects/web_soundboard/', include('apps.web_soundboard.urls')),
    path('projects/chat_highlights/', include('apps.chat_highlights.urls')),
    path('projects/magic_eye/', include('apps.magic_eye.urls')),
    path('projects/whistle_detector/', include('apps.whistle_detector.urls')),
    path('projects/morse_code/', include('apps.morse_code.urls')),
    path('projects/webcam_ruler/', include('apps.webcam_ruler.urls')),
    path('projects/you_laugh_you_lose/', include('apps.you_laugh_you_lose.urls')),
    path('projects/speech_transcriber/', include('apps.speech_transcriber.urls')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include('debug_toolbar.urls'))]
    except ImportError:
        pass
