import json
from io import BytesIO
from urllib.request import urlopen

import yt_dlp
from django.http import JsonResponse
from django.shortcuts import render
from pydub import AudioSegment


def index_view(request):
    return render(request, "voice_stripper/index.html")


def details_view(request):
    return render(request, "voice_stripper/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "voice_stripper/index.html", context={'anchor': 'app'})


def strip_vocal(request):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    youtube_url = body['vid_url']

    with yt_dlp.YoutubeDL({'no-playlist': True,
                           'extract-audio': True,
                           'match_filter': shorter_than_four_min,
                           'format': 'm4a/bestaudio/best'
                           }) as ydl:
        song_info = ydl.extract_info(youtube_url, download=False)
        url = get_best_audio_url(song_info['formats'])
        segment = AudioSegment.from_file(BytesIO(urlopen(url).read()))
    return JsonResponse({'test': "test"})


def shorter_than_four_min(info, *, incomplete):
    """Download only videos shorter than 4 minute (or with unknown duration)"""
    duration = info.get('duration')
    if duration and duration > 240:
        return 'The video is too long (> 4 min)'


def get_best_audio_url(formats):
    audio_formats = []
    for f in reversed(formats):
        if f.get('acodec') != 'none':
            audio_formats.append(f)
    return audio_formats[0]['url']
