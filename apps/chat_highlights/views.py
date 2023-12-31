from django.shortcuts import render

from apps.chat_highlights.business_logic import parse_youtube_chat_logs_from_url


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

        highlight_data = parse_youtube_chat_logs_from_url(youtube_url)
        return render(request, "chat_highlights/chat_highlight_chart.html", context={'data': highlight_data})

    except Exception as e:
        return render(request, "chat_highlights/chat_highlight_chart.html", context={'error': e})


