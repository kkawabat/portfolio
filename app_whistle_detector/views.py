from django.http import JsonResponse
from django.shortcuts import render

from main.models import Post


def whistle_detector_view(request):
    whistle_detector_proj = Post.objects.get(slug="whistle-detector")
    return render(request, 'whistle_detector.html', context={"post": whistle_detector_proj})


def whistle_submit_view(request):
    try:
        audioBlob = request.FILES.get('audioBlob')
        midi_uri = None
        return JsonResponse({'midi': midi_uri})

    except Exception as e:
        return JsonResponse({'error': f"failed to generate whistle midi: {e}"})
