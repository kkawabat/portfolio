from django.urls import path

from .views import web_soundboard_view, web_soundboard_detail_view, web_soundboard_app_view, web_soundboard_sound_effects

urlpatterns = [
    path('', web_soundboard_view, name='web-soundboard'),
    path('details', web_soundboard_detail_view, name='web-soundboard-details'),
    path('app', web_soundboard_app_view, name='web-soundboard-tap'),
    path('soundeffect/<str:sound_id>', web_soundboard_sound_effects, name='sound-effect'),
]
