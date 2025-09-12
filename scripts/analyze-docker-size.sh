#!/bin/bash

# Docker Image Size Analysis Script
# Usage: ./scripts/analyze-docker-size.sh [image_name]

set -e

IMAGE_NAME=${1:-"portfolio"}
TEMP_CONTAINER="size_analysis_$$"

echo "🔍 Analyzing Docker image: $IMAGE_NAME"
echo "=================================="

# Check if image exists
if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
    echo "❌ Image '$IMAGE_NAME' not found!"
    exit 1
fi

# Get image size
IMAGE_SIZE=$(docker images "$IMAGE_NAME" --format "table {{.Size}}" | tail -n 1)
echo "📊 Image size: $IMAGE_SIZE"
echo ""

# Create temporary container for analysis
echo "🔍 Creating temporary container for analysis..."
docker run --name "$TEMP_CONTAINER" -d "$IMAGE_NAME" tail -f /dev/null

# Wait a moment for container to start
sleep 2

echo ""
echo "📁 Directory sizes (top 10):"
echo "============================"
docker exec "$TEMP_CONTAINER" du -sh /* 2>/dev/null | sort -hr | head -10

echo ""
echo "🐍 Python packages (top 15):"
echo "============================"
docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -maxdepth 1 -type d -exec du -sh {} \; 2>/dev/null | sort -hr | head -15

echo ""
echo "📦 Largest files (top 10):"
echo "=========================="
docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -type f -size +10M -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -10

echo ""
echo "🗂️  Largest directories (top 10):"
echo "================================"
docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -type d -exec du -sh {} \; 2>/dev/null | sort -hr | head -10

echo ""
echo "🔍 Checking for common bloat sources:"
echo "====================================="

# Check for CUDA/NVIDIA packages
if docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "*nvidia*" -type d 2>/dev/null | grep -q .; then
    echo "⚠️  NVIDIA packages found (CUDA bloat)"
    docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "*nvidia*" -type d -exec du -sh {} \; 2>/dev/null | sort -hr
fi

# Check for PyTorch
if docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "*torch*" -type d 2>/dev/null | grep -q .; then
    echo "⚠️  PyTorch found"
    docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "*torch*" -type d -exec du -sh {} \; 2>/dev/null | sort -hr
fi

# Check for test files
TEST_SIZE=$(docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "tests" -type d -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
if [ "$TEST_SIZE" != "0" ]; then
    echo "⚠️  Test files found: $TEST_SIZE"
fi

# Check for cache files
CACHE_SIZE=$(docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "__pycache__" -type d -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
if [ "$CACHE_SIZE" != "0" ]; then
    echo "⚠️  Cache files found: $CACHE_SIZE"
fi

echo ""
echo "💡 Optimization suggestions:"
echo "==========================="

# Check if using CPU-only PyTorch
if docker exec "$TEMP_CONTAINER" python -c "import torch; print('CUDA available:', torch.cuda.is_available())" 2>/dev/null | grep -q "True"; then
    echo "🔧 Use CPU-only PyTorch: pip install torch+cpu"
fi

# Check for unnecessary packages
if docker exec "$TEMP_CONTAINER" find /usr/local/lib/python3.11/site-packages -name "*nvidia*" -type d 2>/dev/null | grep -q .; then
    echo "🔧 Remove NVIDIA packages if not using GPU"
fi

if [ "$TEST_SIZE" != "0" ]; then
    echo "🔧 Remove test directories: find . -name 'tests' -type d -exec rm -rf {} +"
fi

if [ "$CACHE_SIZE" != "0" ]; then
    echo "🔧 Remove cache files: find . -name '__pycache__' -type d -exec rm -rf {} +"
fi

echo "🔧 Use multi-stage builds to reduce final image size"
echo "🔧 Use .dockerignore to exclude unnecessary files"
echo "🔧 Consider using Alpine Linux base image for smaller size"

# Clean up
echo ""
echo "🧹 Cleaning up..."
docker stop "$TEMP_CONTAINER" >/dev/null 2>&1
docker rm "$TEMP_CONTAINER" >/dev/null 2>&1

echo "✅ Analysis complete!" 