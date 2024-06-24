import base64
import io
import json
from io import BytesIO
from urllib.request import urlopen

import numpy as np
import yt_dlp
from django.http import JsonResponse
from django.shortcuts import render
from pydub import AudioSegment
from scipy.io.wavfile import write


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
        wav_arr, sr, dtype = extract_audio_array_from_url(youtube_url)
        stripped_arr = apply_voice_stripper(wav_arr, dtype)
        wav_arr64 = encode_audio(stripped_arr, sr)
        return JsonResponse({'audio_data': wav_arr64})
    except Exception as e:
        return JsonResponse({'error': str(e)})


def shorter_than_four_min(info, *, incomplete):
    """Download only videos shorter than 4 minute (or with unknown duration)"""

    playlist_count = info.get('playlist_count')
    if playlist_count and playlist_count > 1:
        raise Exception('Only individual videos can be downloaded')

    duration = info.get('duration')
    if duration and duration > 240:
        raise Exception('The video is too long (> 4 min)')


def get_best_audio_url(formats):
    audio_formats = []
    for f in reversed(formats):
        if f.get('acodec') != 'none' and f.get('ext') == 'm4a':
            audio_formats.append(f)
    return audio_formats[-1]['url']


def extract_audio_array_from_url(youtube_url):
    if '&list' in youtube_url:
        youtube_url = youtube_url.split('&list')[0]

    with yt_dlp.YoutubeDL({'no-playlist': True,
                           'extract-audio': True,
                           'match_filter': shorter_than_four_min,
                           'format': 'm4a/bestaudio/best'
                           }) as ydl:
        song_info = ydl.extract_info(youtube_url, download=False)
        url = get_best_audio_url(song_info['formats'])
        asg = AudioSegment.from_file(BytesIO(urlopen(url).read()))
        dtype = getattr(np, "int{:d}".format(asg.sample_width * 8))  # Or could create a mapping: {1: np.int8, 2: np.int16, 4: np.int32, 8: np.int64}
        wav_arr = np.ndarray((int(asg.frame_count()), asg.channels), buffer=asg.raw_data, dtype=dtype)
    return wav_arr, asg.frame_rate, dtype


def apply_voice_stripper(wav_arr, dtype):
    wav_arr = wav_arr.astype(np.float32)
    a = wav_arr[:, 0] - wav_arr[:, 1]
    a /= np.max(np.abs(wav_arr)) / np.iinfo(dtype).max
    return np.tile(a.astype(dtype), (2, 1)).T


def encode_audio(arr, sr):
    byte_io = io.BytesIO()
    write(byte_io, sr, arr)
    wav_bytes = byte_io.read()
    audio_data64 = base64.b64encode(wav_bytes).decode('UTF-8')
    return f"data:audio/wav;base64, {audio_data64}"
