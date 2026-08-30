# Portfolio — Kan Kawabata

Personal portfolio and interactive project showcase at kankawabata.com.
A Django monolith serving server-rendered pages with 11 interactive demos
spanning ML, audio processing, computer vision, NLP, and device sensors.

## Architecture

- **Framework:** Django 5.2 LTS (Python 3.13)
- **Package manager:** uv
- **Frontend:** Bootstrap 5 + htmx + jQuery (all vendored locally, no build step)
- **Static files:** WhiteNoise (served directly from Django)
- **Database:** SQLite (ephemeral — no custom models, only Django built-in tables)
- **WebSockets:** Django Channels with Daphne (webcam_ruler, morse_code)
- **Deployment:** Cloud Run on GCP, deployed via GitHub Actions
- **Infrastructure:** Terraform in `infra/`
- **Cloud Run billing:** request-based (`cpu_idle = true`). The v2 API defaults
  the other way (instance-based), which with keepalive billed ~$5/day. CI
  deploys pass `--cpu-throttling` so a later `gcloud run deploy` cannot revert it.
- **Domain:** kankawabata.com (registrar: Namecheap, DNS pointed to Cloud Run)
- **Container registry:** GCP Artifact Registry
- **CI/CD auth:** Workload Identity Federation (no long-lived keys)

## Development workflow

- **Push directly to `main`.** This is a personal project — no feature
  branches, PRs, or review ceremony expected.
- **There is no dev or staging deployment.** `main` goes straight to
  production: pushing triggers the GitHub Actions deploy to Cloud Run, and
  changes get verified on the live site at kankawabata.com.
- **The page footer shows a build stamp** — build time plus a link to the
  commit that is serving. Use it to tell whether the deploy you are waiting
  on has actually landed. It is baked into the image at build time
  (`GIT_SHA` / `BUILD_TIME` build args in `Dockerfile`), *not* read from the
  running process: Cloud Run scales to zero, so a process start time would
  reset on any cold start and falsely look like a fresh deploy.

## Apps

Each app in `apps/` is a self-contained Django app with its own views,
templates, and static assets. GameWork multiplayer titles are **not** apps
here — they live as demos in the gamework repo and appear on the homepage
only as external cards (`url` in `projects_config.py`). Each card has one or
more **tags** (`game`, `visual`, `audio`, `text`). The My Projects tab is a
single grid; category buttons at the top filter it by union (All is the
default). `/projects#games` selects Games so GameWork can deep-link here.

Put a new idea in this repo when it needs Python, a server, or is a
single-player page with no GameWork session (Tilt Breakout). A new WebRTC
multiplayer idea goes in `gamework/examples/`.

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
| `you_laugh_you_lose` | Keep-a-straight-face challenge scored by webcam | MediaPipe, YouTube IFrame API |
| `tilt_breakout` | Brick breaker steered by phone tilt | DeviceOrientation, canvas |

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
