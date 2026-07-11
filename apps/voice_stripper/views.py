import json

from django.http import JsonResponse
from django.shortcuts import render

from portfolio.worker_client import call_worker, worker_available


def index_view(request):
    return render(request, "voice_stripper/index.html")


def details_view(request):
    return render(request, "voice_stripper/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "voice_stripper/index.html", context={'anchor': 'app'})


def strip_vocal(request):
    try:
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        youtube_url = body['vid_url']
        if not worker_available():
            raise Exception('Audio processing service is unavailable, please try again later')
        return JsonResponse(call_worker('/strip', {'vid_url': youtube_url}))
    except Exception as e:
        return JsonResponse({'error': str(e)})
