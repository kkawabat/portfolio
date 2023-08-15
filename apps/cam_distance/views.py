from django.shortcuts import render

from apps.main.models import Post


def index_view(request):
    return render(request, 'cam_distance/index.html')


def about_view(request):
    return render(request, 'cam_distance/about.html')


def app_view(request):
    return render(request, 'cam_distance/app.html')
