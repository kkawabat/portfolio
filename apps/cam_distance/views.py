from django.shortcuts import render

from apps.main.models import Post


def cam_distance_app_view(request):
    cam_distance_proj = Post.objects.get(slug="opencv-cam-distance-app")
    return render(request, 'cam_distance/cam_distance_app.html',  context={"post": cam_distance_proj})
