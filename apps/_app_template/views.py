from django.shortcuts import render


def index_view(request):
    return render(request, "{{app_name}}/index.html")


def details_view(request):
    return render(request, "{{app_name}}/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "{{app_name}}/index.html", context={'anchor': 'app'})
