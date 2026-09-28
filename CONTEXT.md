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
- **Cloud Run spend cap:** Console-only kill switch (no API). Pauses new Cloud
  Run usage at $25/month. Do not create it before 2026-09-01 or August spend
  will take the site down; then `infra/scripts/setup-spend-cap.sh`. Lift in
  Billing → Budgets if it trips. Does not stop the TURN VM or Artifact Registry.
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

## Abuse and secrets

Production sets `DJANGO_DEBUG=False`. Cloud Run (`K_SERVICE`) refuses to boot
if debug is on or if `DJANGO_SECRET_KEY` is the committed insecure fallback.
`/admin/` and the debug toolbar exist only when `DEBUG` is on locally.

The GitHub repo being public does **not** leak AWS keys, the Django secret, or
WIF credentials — those live in Secret Manager and GitHub Actions secrets.
It *does* publish every anonymous POST URL. The views that spend money or a
worker (speech transcriber → AWS Transcribe; voice stripper and chat
highlights → Cloud Run workers) are rate-limited per IP and reject oversized
bodies before the vendor is called. Cloning the repo cannot deploy: WIF is
bound to this repository's deploy workflow.

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
