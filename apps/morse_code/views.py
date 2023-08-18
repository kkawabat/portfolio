from django.shortcuts import render

from apps.main.models import Post


def morse_code_app_view(request):
    return render(request, 'morse_code/index.html')


def morse_code_details_view(request):
    return render(request, 'morse_code/index.html', context={'anchor': 'details'})


def morse_code_listen_view(request):
    return render(request, 'morse_code/index.html', context={'anchor': 'listen'})


def morse_code_tap_view(request):
    return render(request, 'morse_code/index.html', context={'anchor': 'tap'})
