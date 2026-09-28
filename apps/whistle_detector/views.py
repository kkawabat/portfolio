from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from whistle_detector.audio_processing import WhistleDetector

from portfolio.hardening import MAX_AUDIO_BYTES, limit_body, ratelimit


def whistle_detector_view(request):
    return render(request, 'whistle_detector/index.html')


@require_POST
@ratelimit('20/h')
@limit_body(MAX_AUDIO_BYTES)
def whistle_submit_view(request):
    try:
        audio_blob = request.FILES.get('audioBlob')
        midi_blob = WhistleDetector.from_webm_blob(audio_blob).to_midi_blob64()
        midi_blob_url = f"data:audio/midi;base64,{midi_blob}"
        return JsonResponse({'midi_blob_url': midi_blob_url})

    except Exception as e:
        return JsonResponse({'error': f"failed to generate whistle midi: {e}"})


def details_view(request):
    return render(request, 'whistle_detector/index.html', context={'anchor': 'details'})


def app_view(request):
    return render(request, 'whistle_detector/index.html', context={'anchor': 'app'})
