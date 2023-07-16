from django.urls import path

from main.views import main_view, cv_view, zach_view, post_request_view

urlpatterns = [
    path('', main_view, name='main'),
    path('cv', cv_view, name='cv'),
    path('post_request', post_request_view, name='post_request'),
    path('donot', zach_view)
]
