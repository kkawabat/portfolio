from django.shortcuts import render

from main.models import Post


def whistle_detector_view(request):
    whistle_detector_proj = Post.objects.get(slug="whistle-detector")
    return render(request, 'whistle_detector.html', context={"post": whistle_detector_proj})
