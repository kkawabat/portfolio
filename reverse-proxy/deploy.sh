#!/bin/bash

# Deploy Reverse Proxy Script
# This script handles the complete deployment of the reverse proxy service

set -e

echo "🚀 Starting reverse proxy deployment..."

# Configuration
REVERSE_PROXY_DIR="/opt/reverse-proxy"
PORTFOLIO_DIR="/opt/portfolio"
BACKUP_DIR="$REVERSE_PROXY_DIR/backups"

# Ensure portfolio repository is up to date
echo "📥 Updating portfolio repository..."
cd "$PORTFOLIO_DIR"

# Handle any local changes that might conflict with the pull
if ! git diff --quiet; then
    echo "⚠️ Local changes detected, stashing them..."
    git stash push -m "Auto-stash before deployment $(date)"
fi

# Pull the latest changes
if git pull origin main; then
    echo "✅ Repository updated successfully"
else
    echo "❌ Failed to update repository"
    exit 1
fi

# Create reverse-proxy directory in /opt (system directory)
echo "📁 Setting up reverse-proxy directory..."
sudo mkdir -p "$REVERSE_PROXY_DIR"
sudo chown kan:kan "$REVERSE_PROXY_DIR"
cd "$REVERSE_PROXY_DIR"

# Create backups directory
mkdir -p "$BACKUP_DIR"

# Backup current configuration if it exists
if [ -f "Caddyfile" ]; then
    echo "📋 Backing up current Caddyfile..."
    cp Caddyfile "$BACKUP_DIR/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)"
fi

if [ -f ".env" ]; then
    echo "📋 Backing up existing .env file..."
    cp .env "$BACKUP_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Stop existing reverse proxy if running
echo "🛑 Stopping existing reverse proxy..."
if docker-compose ps | grep -q "reverse-proxy"; then
    docker-compose down
    echo "✅ Existing reverse proxy stopped"
else
    echo "ℹ️ No existing reverse proxy found"
fi

# Check for system processes using ports 80/443 and stop them
echo "🔍 Checking for system processes using ports 80/443..."
CADDY_PIDS=$(sudo ss -tlnp | grep -E ":80|:443" | grep -o "pid=[0-9]*" | cut -d= -f2 | sort -u)
if [ -n "$CADDY_PIDS" ]; then
    echo "⚠️ Found system processes using ports 80/443:"
    for pid in $CADDY_PIDS; do
        process_info=$(ps -p $pid -o pid,comm,cmd --no-headers 2>/dev/null)
        if [ -n "$process_info" ]; then
            echo "  PID $pid: $process_info"
        fi
    done
    echo "Stopping conflicting system processes..."
    echo "$CADDY_PIDS" | xargs -r sudo kill
    sleep 2
    echo "✅ Conflicting system processes stopped"
else
    echo "✅ No system processes using ports 80/443"
fi

# Check for any containers using ports 80/443 and stop them
echo "🔍 Checking for Docker containers using ports 80/443..."
CONFLICTING_CONTAINERS=$(docker ps --format "{{.Names}}\t{{.Ports}}" | grep -E ":80->|:443->" | cut -f1)
if [ -n "$CONFLICTING_CONTAINERS" ]; then
    echo "⚠️ Found containers using ports 80/443:"
    echo "$CONFLICTING_CONTAINERS"
    echo "Stopping conflicting containers..."
    echo "$CONFLICTING_CONTAINERS" | xargs -r docker stop
    echo "✅ Conflicting containers stopped"
else
    echo "✅ No Docker containers using ports 80/443"
fi

# Also check for any containers with the same name and remove them
echo "🔍 Checking for existing reverse-proxy containers..."
if docker ps -a --format "{{.Names}}" | grep -q "reverse-proxy"; then
    echo "⚠️ Found existing reverse-proxy container, removing it..."
    docker rm -f reverse-proxy
    echo "✅ Existing reverse-proxy container removed"
fi

# Copy new files from portfolio repository
echo "📥 Copying reverse-proxy files..."
if [ -d "$PORTFOLIO_DIR/reverse-proxy" ]; then
    cp -r "$PORTFOLIO_DIR/reverse-proxy"/* "$REVERSE_PROXY_DIR/"
    echo "✅ Files copied successfully"
else
    echo "❌ Source directory $PORTFOLIO_DIR/reverse-proxy not found!"
    exit 1
fi

# Scripts are already executable in the repository

# Verify essential files exist
if [ ! -f "docker-compose.yml" ] || [ ! -f "Caddyfile.template" ] || [ ! -f "generate-caddyfile.sh" ]; then
    echo "❌ Essential files missing after copy!"
    echo "📋 Available files:"
    ls -la
    exit 1
fi

# Set up environment variables
echo "🔧 Setting up environment variables..."

# Create new .env file with core configuration
cat > .env << EOF
# Domain configuration
DOMAIN=${DOMAIN:-kankawabata.com}

# Caddy configuration
CADDY_EMAIL=${CADDY_EMAIL:-kkawabat@asu.edu}
AUTO_HTTPS=${AUTO_HTTPS:-on}
LOG_LEVEL=${LOG_LEVEL:-INFO}
ADMIN_API=${ADMIN_API:-off}

# Portfolio container configuration
PORTFOLIO_CONTAINER=${PORTFOLIO_CONTAINER:-portfolio-app}
PORTFOLIO_PORT=${PORTFOLIO_PORT:-8000}

# Optional subdomain configurations
API_SUBDOMAIN=${API_SUBDOMAIN:-api}
API_CONTAINER=${API_CONTAINER:-api-container}
API_PORT=${API_PORT:-8080}
APP_SUBDOMAIN=${APP_SUBDOMAIN:-app}
APP_CONTAINER=${APP_CONTAINER:-app-container}
APP_PORT=${APP_PORT:-8080}
EOF

echo "✅ Environment variables configured"

# Check for existing subdomain configurations
if [ -f "subdomains.conf" ] && [ -s "subdomains.conf" ]; then
    echo "📋 Found existing subdomain configurations:"
    grep -v '^#' subdomains.conf | grep -v '^$' | while read -r line; do
        echo "  - $line"
    done
else
    echo "ℹ️ No existing subdomain configurations found"
fi

# Generate Caddyfile from template
echo "🔧 Generating Caddyfile from template..."
if [ -f "generate-caddyfile.sh" ]; then
    # Backup current Caddyfile to check for changes
    if [ -f "Caddyfile" ]; then
        cp Caddyfile Caddyfile.previous
    fi
    
    ./generate-caddyfile.sh
    
    # Check if Caddyfile changed
    if [ -f "Caddyfile.previous" ] && ! diff -q Caddyfile.previous Caddyfile >/dev/null 2>&1; then
        echo "📝 Caddyfile configuration changed"
        CADDYFILE_CHANGED=true
    else
        echo "ℹ️ Caddyfile configuration unchanged"
        CADDYFILE_CHANGED=false
    fi
    
    # Clean up backup
    rm -f Caddyfile.previous
else
    echo "❌ generate-caddyfile.sh not found!"
    exit 1
fi

# Validate the generated Caddyfile
echo "🔍 Validating generated Caddyfile..."
if command -v caddy &> /dev/null; then
    if caddy validate --config Caddyfile --adapter caddyfile; then
        echo "✅ Caddyfile validation passed!"
    else
        echo "❌ Caddyfile validation failed!"
        exit 1
    fi
else
    echo "⚠️ Caddy not found, skipping validation"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p /var/log/caddy

# Create Docker network if it doesn't exist
echo "🌐 Creating Docker network..."
if ! docker network ls | grep -q "app_network"; then
    docker network create app_network
    echo "✅ Created app_network"
else
    echo "✅ app_network already exists"
fi

# Start or restart reverse proxy
echo "🚀 Starting reverse proxy..."

# Try docker-compose first
if docker-compose up -d 2>/dev/null; then
    echo "✅ Reverse proxy started successfully with docker-compose!"
    CADDY_STARTED=true
else
    echo "⚠️ docker-compose failed, trying manual Docker commands..."
    
    # Remove any existing reverse-proxy container
    if docker ps -a --format "{{.Names}}" | grep -q "reverse-proxy"; then
        echo "🗑️ Removing existing reverse-proxy container..."
        docker rm -f reverse-proxy
    fi
    
    # Start Caddy with manual Docker command
    if docker run -d \
        --name reverse-proxy \
        --network app_network \
        -p 80:80 \
        -p 443:443 \
        -v "$(pwd)/Caddyfile:/etc/caddy/Caddyfile:ro" \
        -v caddy_data:/data \
        -v caddy_config:/config \
        --restart unless-stopped \
        caddy:2-alpine; then
        echo "✅ Reverse proxy started successfully with manual Docker command!"
        CADDY_STARTED=true
    else
        echo "❌ Failed to start reverse proxy with manual Docker command!"
        exit 1
    fi
fi

# Restart reverse proxy only if configuration changed
if [ "$CADDYFILE_CHANGED" = true ] && [ "$CADDY_STARTED" = true ]; then
    echo "🔄 Restarting reverse proxy to apply configuration changes..."
    if docker restart reverse-proxy; then
        echo "✅ Reverse proxy restarted successfully!"
    else
        echo "❌ Failed to restart reverse proxy!"
        exit 1
    fi
elif [ "$CADDYFILE_CHANGED" = false ]; then
    echo "ℹ️ No restart needed - configuration unchanged"
fi

# Wait for Caddy to initialize
echo "⏳ Waiting for Caddy to initialize..."
sleep 10

# Check if reverse proxy is running
if docker ps --format "{{.Names}}" | grep -q "reverse-proxy"; then
    echo "✅ Reverse proxy is running!"
    
    # Show container status
    echo "📊 Container status:"
    docker ps --filter "name=reverse-proxy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Show logs
    echo "📋 Recent logs:"
    docker logs --tail=20 reverse-proxy
    
    echo "🎉 Deployment completed successfully!"
    
    # Verify automatic startup configuration
    echo "🔧 Verifying automatic startup configuration..."
    
    # Check if Docker is enabled for automatic startup
    if systemctl is-enabled docker >/dev/null 2>&1; then
        echo "✅ Docker is enabled for automatic startup"
    else
        echo "⚠️ Docker is not enabled for automatic startup"
        echo "   Run: sudo systemctl enable docker"
    fi
    
    # Check container restart policies
    echo "📋 Container restart policies:"
    echo "  - Portfolio: restart: unless-stopped"
    echo "  - Reverse Proxy: restart: unless-stopped"
    echo "✅ Containers will automatically restart after reboot"
    
else
    echo "❌ Reverse proxy failed to start!"
    echo "📋 Container logs:"
    if docker ps -a --format "{{.Names}}" | grep -q "reverse-proxy"; then
        docker logs reverse-proxy
    else
        echo "No reverse-proxy container found"
    fi
    exit 1
fi
