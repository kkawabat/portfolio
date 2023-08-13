from django.shortcuts import render


def main_view(request):
    return render(request, 'new_main/index2.html')


def cv_view():
    return None


def post_request_view():
    return None
