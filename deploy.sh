#!/bin/bash

# Deployment script for the droplet
# This script is called by GitHub Actions

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /opt/portfolio

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Create .env file with environment variables
echo "🔧 Setting up environment variables..."
cat > .env << EOF
DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
DJANGO_DEBUG=False
YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_DEFAULT_REGION=us-east-1
EOF

# Stop existing container
echo "🛑 Stopping existing container..."
docker-compose down

# Build new image
echo "🔨 Building new Docker image..."
docker-compose build --no-cache

# Start the application
echo "▶️ Starting application..."
docker-compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 30

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Container is running successfully!"
else
    echo "❌ Container failed to start!"
    docker-compose logs
    exit 1
fi

# Clean up old images to save space
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Show final status
echo "📊 Final container status:"
docker-compose ps

echo "🎉 Deployment completed successfully!"
