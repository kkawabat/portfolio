from django.shortcuts import render

from apps.main.models import Post


def index_view(request):
    return render(request, 'webcam_ruler/index.html')


def about_view(request):
    return render(request, 'webcam_ruler/about.html')


def app_view(request):
    return render(request, 'webcam_ruler/app.html')
