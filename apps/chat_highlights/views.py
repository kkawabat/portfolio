from django.shortcuts import render

from portfolio.worker_client import call_worker, worker_available


def index_view(request):
    return render(request, "chat_highlights/index.html")


def details_view(request):
    return render(request, "chat_highlights/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "chat_highlights/index.html", context={'anchor': 'app'})


def get_history_view(request):
    try:
        youtube_url = request.POST['youtube-link']
        if len(youtube_url) == 0:
            raise Exception("Please link a valid youtube video")

        if not worker_available():
            raise Exception("Chat processing service is unavailable, please try again later")

        highlight_data = call_worker('/parse-chat', {'youtube_url': youtube_url})
        if 'error' in highlight_data:
            raise Exception(highlight_data['error'])
        return render(request, "chat_highlights/chat_highlight_chart.html", context={'data': highlight_data})

    except Exception as e:
        return render(request, "chat_highlights/chat_highlight_chart.html", context={'error': e})
