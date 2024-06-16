import json

from django.http import JsonResponse
from django.shortcuts import render
from transformers import pipeline
SENTIMENT_PIPELINE = None


def index_view(request):
    return render(request, "eliza_parser/index.html")


def details_view(request):
    return render(request, "eliza_parser/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "eliza_parser/index.html", context={'anchor': 'app'})


def analyze(request):
    global SENTIMENT_PIPELINE
    if SENTIMENT_PIPELINE is None:
        SENTIMENT_PIPELINE = pipeline("sentiment-analysis", model='distilbert-base-uncased-finetuned-sst-2-english')

    output = []
    dialog_list = json.loads(request.body.decode('utf8'))
    sentiments = SENTIMENT_PIPELINE(dialog_list)
    for dialog, sentiment in zip(dialog_list, sentiments):
        sentiment['text'] = dialog
        if sentiment['label'] == "NEGATIVE":
            sentiment['value'] = -1 * sentiment['score']
        else:
            sentiment['value'] = sentiment['score']
        output.append(sentiment)
    return JsonResponse({"sentiment_results": output})