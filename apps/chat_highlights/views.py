from django.http import HttpResponse
from django.shortcuts import render

from apps.chat_highlights.business_logic import parse_chat, fetch_youtube_chat_logs


def index_view(request):
    return render(request, "chat_highlights/index.html")


def details_view(request):
    return render(request, "chat_highlights/index.html")


def app_view(request):
    return render(request, "chat_highlights/index.html")


def get_history_view(request):
    youtube_url = request.POST['youtube-link']
    youtube_url = 'https://www.youtube.com/watch?v=NrY0kCOc-zw&list=PLFs19LVskfNzQLZkGG_zf6yfYTp_3v_e6&ab_channel=Destiny'
    chat_log_path = fetch_youtube_chat_logs(youtube_url)
    highlight_data = parse_chat(chat_log_path)

    return render(request, "chat_highlights/chat_highlight_chart.html", context={'data': highlight_data})
