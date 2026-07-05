FROM python:3.13-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.13-slim AS production

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r worker && useradd -r -g worker worker

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

COPY main.py voice_stripper.py chat_highlights.py ./

RUN mkdir -p /app/chat_logs && chown -R worker:worker /app

ENV PYTHONUNBUFFERED=1 \
    CHAT_LOG_DIR=/app/chat_logs \
    PORT=8080

USER worker

EXPOSE ${PORT}

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT} --timeout-keep-alive 300
