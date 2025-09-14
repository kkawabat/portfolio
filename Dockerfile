# Multi-stage build for optimized image size
FROM python:3.11-slim AS builder

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    # OpenGL and graphics
    libgl1-mesa-dri \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    # GStreamer
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    # Audio
    portaudio19-dev \
    libasound2-dev \
    # OpenCV
    libopencv-dev \
    libgtk-3-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    # PyTorch and ML
    libopenblas-dev \
    liblapack-dev \
    libhdf5-dev \
    libffi-dev \
    # Image processing (Pillow)
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libfreetype6-dev \
    # FFmpeg (for av package)
    ffmpeg \
    libavutil-dev \
    # Additional math libraries
    libblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.7.1

# Configure Poetry: Install to system Python (we're in a container)
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=0 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Set work directory
WORKDIR /app

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Install dependencies to system Python
RUN poetry config virtualenvs.create false && \
    poetry install --only=main --no-dev && \
    rm -rf $POETRY_CACHE_DIR

# Production stage
FROM python:3.11-slim AS production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    # OpenGL and graphics
    libgl1-mesa-dri \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    # GStreamer
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    # Audio
    libportaudio2 \
    libasound2 \
    # Basic image processing
    libjpeg62-turbo \
    libpng16-16 \
    libfreetype6 \
    # Basic math libraries
    libblas3 \
    liblapack3 \
    # FFmpeg (let Python packages handle their own dependencies)
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r portfolio && useradd -r -g portfolio portfolio

# Set work directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R portfolio:portfolio /app

# Switch to non-root user
USER portfolio

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/', timeout=10)"

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--worker-class", "gevent", "--worker-connections", "1000", "--max-requests", "1000", "--max-requests-jitter", "100", "--timeout", "30", "--keep-alive", "2", "portfolio.wsgi:application"]
