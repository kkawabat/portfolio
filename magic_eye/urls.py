from django.urls import path

from magic_eye.views import magic_eye_view, magic_eye_generate_view, magic_eye_decode_view

urlpatterns = [
    path('magic_eye', magic_eye_view, name='magic_eye'),
    path('magic_eye_generate', magic_eye_generate_view),
    path('magic_eye_decode', magic_eye_decode_view),
]
