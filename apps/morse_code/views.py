from django.shortcuts import render

from apps.main.models import Post


def morse_code_app_view(request):
    morse_code_proj = Post.objects.get(slug="morse-code-app")
    return render(request, 'morse_code/morse_code_app.html', context={"post": morse_code_proj})
