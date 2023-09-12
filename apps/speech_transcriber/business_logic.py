import json
import time
from datetime import datetime

from os.path import join

import boto3

s3_client = boto3.client('s3')
transcribe_client = boto3.client('transcribe')

BUCKET = "kankawabata-portfolio"
s3_audio_dir_path = 'app_data/speech_transcriber/transcript_audio/'
s3_transcript_dir_path = 'app_data/speech_transcriber/transcripts/'


def upload_audio_to_s3(audio_blob):
    with audio_blob.file as data:
        file_id = datetime.now().strftime("%Y%m%d-%H%M%S-%f.webm")
        key = join(s3_audio_dir_path, file_id)
        s3_client.upload_fileobj(data, BUCKET, key)
    return f"s3://{BUCKET}/{key}"


def transcribe_file(file_uri):
    file_extension = file_uri.split('.')[-1]

    transcript_id = file_uri.split('/')[-1].split('.')[0] + '_transcript'
    transcript_job_name = transcript_id + '-job'
    transcribe_client.start_transcription_job(
        TranscriptionJobName=transcript_job_name,
        OutputBucketName=BUCKET,
        OutputKey=join(s3_transcript_dir_path, transcript_id + '.json'),
        Media={'MediaFileUri': file_uri},
        MediaFormat=file_extension,
        LanguageCode='en-US'
    )

    max_tries = 60
    while max_tries > 0:
        max_tries -= 1
        job = transcribe_client.get_transcription_job(TranscriptionJobName=transcript_job_name)
        job_status = job['TranscriptionJob']['TranscriptionJobStatus']
        if job_status in ['COMPLETED', 'FAILED']:
            print(f"Job {transcript_job_name} is {job_status}.")
            if job_status == 'COMPLETED':
                return job['TranscriptionJob']['Transcript']['TranscriptFileUri']
            raise Exception('Transcript failed to generate: AWS failed to transcribe.')
        else:
            print(f"Waiting for {transcript_job_name}. Current status is {job_status}.")
        time.sleep(10)
    raise Exception('Transcript failed to generate: timed out')


def fetch_transcript(transcript_uri):
    uri_components = transcript_uri.split('/', 4)
    bucket_name = uri_components[-2]
    key_name = uri_components[-1]
    resp = s3_client.get_object(Bucket=bucket_name, Key=key_name)
    return json.loads(resp['Body'].read().decode('utf-8'))


def processes_transcript(aws_transcript_obj):
    transcript = aws_transcript_obj['results']['transcripts'][0]['transcript']

    word_items = []
    word_idx = 0
    for item in aws_transcript_obj['results']['items']:
        word_items.append({
            "start": item.get('start_time'),
            "end": item.get('end_time'),
            "confidence": item['alternatives'][0]['confidence'],
            "text": item['alternatives'][0]['content'],
            "type": item['type'],
            "word_idx": word_idx
        })
        if item['type'] == 'pronunciation':
            word_idx += 1

    return {'transcript': transcript, 'word_items': word_items}


def test():
    file_uri = 's3://test-transcribe/answer2.wav'
    transcribe_file(file_uri)


if __name__ == '__main__':
    test()
