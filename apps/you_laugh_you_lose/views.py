from django.shortcuts import render


def index_view(request):
    return render(request, 'you_laugh_you_lose/index.html')


def details_view(request):
    return render(request, 'you_laugh_you_lose/index.html', context={'anchor': 'details'})


def app_view(request):
    return render(request, 'you_laugh_you_lose/index.html', context={'anchor': 'app'})
