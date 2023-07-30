from django.urls import path

from app_morse_code.views import morse_code_app_view
from main.views import main_view, cv_view, post_request_view

urlpatterns = [
    path('', morse_code_app_view, name='morse_code_main'),
]
