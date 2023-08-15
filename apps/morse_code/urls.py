from django.urls import path

from apps.morse_code.views import morse_code_app_view

urlpatterns = [
    path('', morse_code_app_view, name='morse-code'),
]
