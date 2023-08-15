from django.shortcuts import render

from apps.main.models import Post


def morse_code_app_view(request):
    return render(request, 'morse_code/index.html')


def morse_code_about_view(request):
    return render(request, 'morse_code/about.html')


def morse_code_listen_view(request):
    return render(request, 'morse_code/listening_app.html')


def morse_code_tap_view(request):
    return render(request, 'morse_code/tapping_app.html')