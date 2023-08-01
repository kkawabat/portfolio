from django.urls import path

from magic_eye.views import magic_eye_view, magic_eye_generate_view, magic_eye_decode_view

urlpatterns = [
    path('', magic_eye_view, name='magic_eye'),
    path('generate', magic_eye_generate_view, name='magic_eye_generate'),
    path('decode', magic_eye_decode_view, name='magic_eye_decode'),
]
