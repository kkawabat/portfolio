from django.urls import path

from .views import magic_eye_view, magic_eye_generate_page_view,  magic_eye_generate_view, magic_eye_decode_page_view, magic_eye_decode_view, magic_eye_about_view

urlpatterns = [
    path('', magic_eye_view, name='magic-eye'),
    path('generate', magic_eye_generate_page_view, name='magic-eye-construct'),
    path('generate', magic_eye_generate_view, name='magic_eye_generate'),
    path('decode', magic_eye_decode_page_view, name='magic-eye-deconstruct'),
    path('decode', magic_eye_decode_view, name='magic_eye_decode'),
    path('about', magic_eye_about_view, name='magic-eye-about'),
]
