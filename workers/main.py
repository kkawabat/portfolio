import logging

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from chat_highlights import parse_youtube_chat_logs_from_url
from voice_stripper import strip_vocal_from_url

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
)

app = FastAPI(title="Portfolio Workers")


class StripRequest(BaseModel):
    vid_url: str


class ParseChatRequest(BaseModel):
    youtube_url: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/strip")
def strip_vocal(req: StripRequest):
    try:
        audio_data = strip_vocal_from_url(req.vid_url)
        return {"audio_data": audio_data}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)


@app.post("/parse-chat")
def parse_chat(req: ParseChatRequest):
    try:
        return parse_youtube_chat_logs_from_url(req.youtube_url)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
