from django.urls import path

from magic_eye.views import magic_eye_view

urlpatterns = [
    path('magic_eye', magic_eye_view, name='magic_eye'),
]
