from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from apps.speech_transcriber.business_logic import upload_audio_to_s3, transcribe_file, processes_transcript, fetch_transcript


def index_view(request):
    return render(request, "speech_transcriber/index.html")


def details_view(request):
    return render(request, "speech_transcriber/index.html", context={'anchor': 'details'})


def app_view(request):
    return render(request, "speech_transcriber/index.html", context={'anchor': 'app'})


def sample_transcript_view(request):
    transcript = {"jobName": "20230910-130337-972241_transcript-job", "accountId": "494828883331",
                  "results": {"transcripts": [{"transcript": "Hopefully this is the last test."}],
                              "items": [{"start_time": "0.2", "end_time": "0.769",
                                         "alternatives": [{"confidence": "0.999", "content": "Hopefully"}], "type": "pronunciation"},
                                        {"start_time": "0.779", "end_time": "0.959",
                                         "alternatives": [{"confidence": "0.999", "content": "this"}], "type": "pronunciation"},
                                        {"start_time": "0.97", "end_time": "1.09",
                                         "alternatives": [{"confidence": "0.997", "content": "is"}], "type": "pronunciation"},
                                        {"start_time": "1.1", "end_time": "1.149",
                                         "alternatives": [{"confidence": "0.997", "content": "the"}], "type": "pronunciation"},
                                        {"start_time": "1.159", "end_time": "1.509",
                                         "alternatives": [{"confidence": "0.999", "content": "last"}], "type": "pronunciation"},
                                        {"start_time": "1.519", "end_time": "2.089",
                                         "alternatives": [{"confidence": "0.999", "content": "test"}], "type": "pronunciation"},
                                        {"alternatives": [{"confidence": "0.0", "content": "."}], "type": "punctuation"}]},
                  "status": "COMPLETED"}
    processed_results = processes_transcript(transcript)
    return render(request, "speech_transcriber/sample_transcript_view.html", context=processed_results)


def submit_audio(request):
    try:
        file_uri = upload_audio_to_s3(request.FILES['audioBlob'])
        transcript_uri = transcribe_file(file_uri)
        t = fetch_transcript(transcript_uri)
        result = processes_transcript(t)
        result['transcript_uri'] = transcript_uri
        result['transcript_view'] = render_to_string('speech_transcriber/transcript_view.html', context=result)
    except Exception as e:
        return JsonResponse({'error': e})
    return JsonResponse(result)
