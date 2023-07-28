import whistle_detector
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from main.models import Post
from src.whistle_detector.audio_processing import WhistleDetector


def whistle_detector_view(request):
    whistle_detector_proj = Post.objects.get(slug="whistle-detector")
    return render(request, 'whistle_detector.html', context={"post": whistle_detector_proj})


def whistle_submit_view(request):
    try:
        audio_blob = request.FILES.get('audioBlob')
        midi_blob = WhistleDetector.from_webm_blob(audio_blob).to_midi_blob()
        html = render_to_string("midi_player.html", context={'midi_blob': midi_blob})
        return JsonResponse(html)

    except Exception as e:
        return JsonResponse({'error': f"failed to generate whistle midi: {e}"})
