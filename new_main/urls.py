from django.urls import path

from new_main.views import main_view, cv_view, post_request_view

urlpatterns = [
    path('', main_view, name='new_main'),
    path('cv', cv_view, name='cv'),
    path('post_request', post_request_view, name='post_request'),
]
