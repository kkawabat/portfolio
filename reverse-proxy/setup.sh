#!/bin/bash

# Reverse Proxy Setup Script
# This script sets up the reverse proxy on the droplet

set -e  # Exit on any error

echo "🚀 Starting reverse proxy setup..."

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    echo "⚠️ Running as root. Consider using a non-root user with sudo privileges."
fi

# Create reverse-proxy directory
echo "📁 Creating reverse-proxy directory..."
sudo mkdir -p /opt/reverse-proxy
cd /opt/reverse-proxy

# Copy files from portfolio repository
echo "📥 Copying reverse-proxy files..."
if [ -d "/opt/portfolio/reverse-proxy" ]; then
    sudo cp -r /opt/portfolio/reverse-proxy/* /opt/reverse-proxy/
else
    echo "❌ Portfolio repository not found at /opt/portfolio"
    echo "Please ensure the portfolio repository is cloned to /opt/portfolio first"
    exit 1
fi

# Set proper permissions
echo "🔐 Setting proper permissions..."
sudo chown -R $USER:$USER /opt/reverse-proxy
chmod +x /opt/reverse-proxy/setup.sh

# Create logs directory
echo "📝 Creating logs directory..."
mkdir -p logs

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Caddy Reverse Proxy Environment Variables

# Domain configuration (required)
DOMAIN=mydomain.com

# Email for Let's Encrypt certificates (required)
CADDY_EMAIL=your-email@domain.com

# Portfolio container configuration
PORTFOLIO_CONTAINER=portfolio
PORTFOLIO_PORT=8000

# HTTPS and security settings
AUTO_HTTPS=on
LOG_LEVEL=INFO
ADMIN_API=off

# Optional: API subdomain configuration
API_SUBDOMAIN=api
API_CONTAINER=api-container
API_PORT=8080

# Optional: App subdomain configuration
APP_SUBDOMAIN=app
APP_CONTAINER=app-container
APP_PORT=8080
EOF
    echo "⚠️ Please edit .env file and set your domain and email address"
fi

# Check if Docker is installed
echo "🐳 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if portfolio network exists
echo "🌐 Checking Docker networks..."
if ! docker network ls | grep -q "portfolio_default"; then
    echo "⚠️ Portfolio network not found. Creating it..."
    docker network create portfolio_default
fi

# Stop any existing reverse proxy
echo "🛑 Stopping any existing reverse proxy..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down 2>/dev/null || true
fi

# Build and start the reverse proxy
echo "🔨 Building and starting reverse proxy..."
docker-compose up -d

# Wait for Caddy to start
echo "⏳ Waiting for Caddy to initialize..."
sleep 15

# Check if Caddy is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Reverse proxy is running successfully!"
    
    # Show status
    echo "📊 Container status:"
    docker-compose ps
    
    # Show network connections
    echo "🌐 Network connections:"
    docker network inspect portfolio_default --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null || echo "No containers connected to portfolio network"
    
    echo ""
    echo "🎉 Reverse proxy setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit /opt/reverse-proxy/.env and set your email address"
    echo "2. Edit /opt/reverse-proxy/Caddyfile and configure your domains"
    echo "3. Run: docker-compose restart"
    echo "4. Test your domains with HTTPS"
    
else
    echo "❌ Reverse proxy failed to start!"
    echo "📋 Checking logs..."
    docker-compose logs
    exit 1
fi
