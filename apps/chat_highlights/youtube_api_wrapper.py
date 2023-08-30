# -*- coding: utf-8 -*-

# Sample Python code for youtube.videos.list
# See instructions for running these code samples locally:
# https://developers.google.com/explorer-help/code-samples#python

import os

import dotenv
from googleapiclient.discovery import build
scopes = ["https://www.googleapis.com/auth/youtube.readonly"]
dotenv.load_dotenv()


def fetch_youtube_vid_metadata(vid_id):
    youtube = build("youtube", version="v3", developerKey=os.environ['YOUTUBE_API_KEY'])

    request = youtube.videos().list(part="snippet", id=vid_id)
    response = request.execute()
    if len(response.get('items')) != 0:
        return response.get('items')[0]
    raise Exception(f"video with id {vid_id} does not exist")


if __name__ == "__main__":
    fetch_youtube_vid_metadata('zJF1uYK2v4I')
