import json

from django.http import JsonResponse
from django.shortcuts import render
from transformers import pipeline
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

SENTIMENT_PIPELINE = None


def index_view(request):
    return render(request, "eliza_parser/index.html")


def details_view(request):
    return render(request, "eliza_parser/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "eliza_parser/index.html", context={'anchor': 'app'})


def analyze_old(request):
    global SENTIMENT_PIPELINE
    if SENTIMENT_PIPELINE is None:
        # distilbert-base-uncased-finetuned-sst-2-english was too large for my small server =( had to use a smaller model
        SENTIMENT_PIPELINE = pipeline("sentiment-analysis", model='distilbert-base-uncased-finetuned-sst-2-english')
        # SENTIMENT_PIPELINE = pipeline('sentiment-analysis', model='AlexAnge/small-sentiment-model')
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


def analyze(request):
    sid_obj = SentimentIntensityAnalyzer()

    dialog_list = json.loads(request.body.decode('utf8'))
    output = []
    for i, line in enumerate(dialog_list):
        sentiment_dict = sid_obj.polarity_scores(line)
        bipolar = sentiment_dict['neg'] != 0 and sentiment_dict['pos'] != 0

        if bipolar:
            neg_pos = -sentiment_dict['neu']/2
            neu_pos = sentiment_dict['neu']/2
            pos_pos = sentiment_dict['neu']/2 + sentiment_dict['pos']
        else:
            neg_pos = -sentiment_dict['neu']
            if sentiment_dict['pos'] != 0:
                neu_pos = sentiment_dict['neu']
            elif sentiment_dict['neg'] == 0:
                neu_pos = .5
            else:
                neu_pos = 0

            pos_pos = 1

        output.append({'turn': i, 'label': 'neg', 'position': neg_pos, 'value': sentiment_dict['neg'], 'text': line})
        output.append({'turn': i, 'label': 'neu', 'position': neu_pos, 'value': sentiment_dict['neu'], 'text': line})
        output.append({'turn': i, 'label': 'pos', 'position': pos_pos, 'value': sentiment_dict['pos'], 'text': line})
    return JsonResponse({"sentiment_results": output})
