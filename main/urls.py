from django.urls import path

from main.views import main_view

urlpatterns = [
    path('', main_view),
]
