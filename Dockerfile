FROM python:3.13-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    portaudio19-dev \
    libasound2-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.13-slim AS production

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgomp1 \
    libportaudio2 \
    libasound2 \
    libjpeg62-turbo \
    libpng16-16 \
    libfreetype6 \
    libblas3 \
    liblapack3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r portfolio && useradd -r -g portfolio portfolio

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p /app/staticfiles /app/media /app/logs /app/.config /app/db_data && \
    chown -R portfolio:portfolio /app

ENV MPLCONFIGDIR=/app/.config/matplotlib \
    PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    FONTCONFIG_PATH=/etc/fonts \
    FONTCONFIG_FILE=/etc/fonts/fonts.conf \
    PORT=8080

USER portfolio

RUN python manage.py collectstatic --noinput --verbosity=0

# Stamped by CI so the live page can show exactly which commit is serving it.
# Declared last so changing it does not invalidate any earlier build layer.
ARG GIT_SHA=dev
ARG BUILD_TIME=
ENV GIT_SHA=${GIT_SHA} \
    BUILD_TIME=${BUILD_TIME}

EXPOSE ${PORT}

ENTRYPOINT ["/entrypoint.sh"]

CMD gunicorn --bind 0.0.0.0:${PORT} --workers 2 --worker-class sync \
    --max-requests 1000 --max-requests-jitter 100 --timeout 300 \
    --keep-alive 2 --preload portfolio.wsgi:application
