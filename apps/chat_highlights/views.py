from django.shortcuts import render


def index_view(request):
    return render(request, "chat_highlights/index.html")


def details_view(request):
    return render(request, "chat_highlights/index.html")


def app_view(request):
    return render(request, "chat_highlights/index.html")
