# Portfolio — Kan Kawabata

Personal portfolio and interactive project showcase at kankawabata.com.
A Django monolith serving server-rendered pages with 10 interactive demos
spanning ML, audio processing, computer vision, and NLP.

## Architecture

- **Framework:** Django 5.2 LTS (Python 3.13)
- **Package manager:** uv
- **Frontend:** Bootstrap 5 + htmx + jQuery (all vendored locally, no build step)
- **Static files:** WhiteNoise (served directly from Django)
- **Database:** SQLite (ephemeral — no custom models, only Django built-in tables)
- **WebSockets:** Django Channels with Daphne (webcam_ruler, morse_code)
- **Deployment:** Cloud Run on GCP, deployed via GitHub Actions
- **Infrastructure:** Terraform in `infra/`
- **Domain:** kankawabata.com (registrar: Namecheap, DNS pointed to Cloud Run)
- **Container registry:** GCP Artifact Registry
- **CI/CD auth:** Workload Identity Federation (no long-lived keys)

## Apps

Each app in `apps/` is a self-contained Django app with its own views,
templates, and static assets:

| App | What it does | Notable deps |
|-----|-------------|--------------|
| `new_main` | Homepage / landing page | — |
| `magic_eye` | Autostereogram generator | MagicEyeUtil (custom) |
| `whistle_detector` | ML whistle detection | PyTorch, Transformers |
| `morse_code` | Morse code translator | WebSocket, Morse-Code-Util (custom) |
| `speech_transcriber` | Speech-to-text | AWS S3 + Transcribe |
| `webcam_ruler` | Camera-based measurement | WebSocket, WebRTC, OpenCV |
| `voice_stripper` | Vocal removal from audio | pydub, FFmpeg |
| `web_soundboard` | Interactive soundboard | — |
| `chat_highlights` | YouTube chat highlight parser | YouTube API, pandas |
| `eliza_parser` | ELIZA chatbot | — |

## External services

- **AWS S3 + Transcribe** — speech_transcriber uploads audio and polls for transcription
- **YouTube Data API** — chat_highlights fetches live chat data
- **PyTorch CPU inference** — whistle_detector runs a Transformers model server-side

## Key directories

```
apps/           Django apps (one per project demo)
infra/          Terraform (GCP infrastructure)
static/         Global static assets + vendored JS/CSS libraries
templates/      Global Django templates (_base.html, error pages)
portfolio/      Django project config (settings, urls, wsgi, asgi)
```

## Future work

- Split ML-heavy apps (whistle_detector, voice_stripper) into separate
  Cloud Run services for smaller main image and independent scaling
