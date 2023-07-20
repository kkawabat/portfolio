from django.shortcuts import render


def magic_eye_view(request):
    return render(request, 'magic_eye.html')
