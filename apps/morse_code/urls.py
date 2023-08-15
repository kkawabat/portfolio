from django.urls import path

from apps.morse_code.views import morse_code_app_view, morse_code_about_view, morse_code_listen_view, morse_code_tap_view

urlpatterns = [
    path('', morse_code_app_view, name='morse-code'),
    path('about', morse_code_about_view, name='morse-code-about'),
    path('listen', morse_code_listen_view, name='morse-code-listen'),
    path('tap', morse_code_tap_view, name='morse-code-tap'),
]
