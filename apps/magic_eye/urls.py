from django.urls import path

from .views import magic_eye_view, magic_eye_generate_page_view,  magic_eye_generate_view, magic_eye_decode_page_view, magic_eye_decode_view, details_view

urlpatterns = [
    path('', magic_eye_view, name='magic-eye-app'),
    path('construct', magic_eye_generate_page_view, name='magic-eye-construct-page'),
    path('construct_request', magic_eye_generate_view, name='magic-eye-construct'),
    path('deconstruct', magic_eye_decode_page_view, name='magic-eye-deconstruct-page'),
    path('deconstruct_request', magic_eye_decode_view, name='magic-eye-deconstruct'),
    path('details', details_view, name='magic-eye-details'),
]
