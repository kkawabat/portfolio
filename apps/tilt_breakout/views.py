from django.shortcuts import render


def index_view(request):
    return render(request, 'tilt_breakout/index.html')


def details_view(request):
    return render(request, 'tilt_breakout/index.html', context={'anchor': 'details'})


def app_view(request):
    return render(request, 'tilt_breakout/index.html', context={'anchor': 'app'})
