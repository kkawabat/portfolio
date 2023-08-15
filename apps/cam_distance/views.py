from django.shortcuts import render

from apps.main.models import Post


def index_view(request):
    cam_distance_proj = Post.objects.get(slug="opencv-cam-distance-app")
    return render(request, 'cam_distance/index.html', context={"post": cam_distance_proj})


def about_view(request):
    return render(request, 'cam_distance/about.html')


def app_view(request):
    return render(request, 'cam_distance/app.html')
