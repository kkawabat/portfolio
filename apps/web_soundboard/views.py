import os
from os.path import abspath, join, dirname

from django.http import HttpResponse
from django.shortcuts import render


# Create your views here.
def web_soundboard_view(request):
    sound_effect_dir = join(dirname(abspath(__file__)), 'static', 'web_soundboard', 'sound_effects')
    sound_effects = [f.split('.')[0] for f in sorted(os.listdir(sound_effect_dir))]
    return render(request, 'web_soundboard/index.html', context={'anchor': 'app', 'sound_effects': sound_effects})


def web_soundboard_detail_view(request):
    sound_effect_dir = join(dirname(abspath(__file__)), 'static', 'web_soundboard', 'sound_effects')
    sound_effects = [f.split('.')[0] for f in sorted(os.listdir(sound_effect_dir))]
    return render(request, 'web_soundboard/index.html', context={'anchor': 'app', 'sound_effects': sound_effects})


def web_soundboard_app_view(request):
    sound_effect_dir = join(dirname(abspath(__file__)), 'static', 'web_soundboard', 'sound_effects')
    sound_effects = [f.split('.')[0] for f in sorted(os.listdir(sound_effect_dir))]
    return render(request, 'web_soundboard/index.html', context={'anchor': 'app', 'sound_effects': sound_effects})


def web_soundboard_sound_effects(_, sound_id):
    sound_path = join(dirname(abspath(__file__)), 'static', 'web_soundboard', 'sound_effects', sound_id + '.mp3')
    with open(sound_path, 'rb') as ifile:
        response = HttpResponse()
        response.write(ifile.read())
        response['Content-Type'] = 'audio/mp3'
        response['Content-Length'] = os.path.getsize(sound_path)
    return response
