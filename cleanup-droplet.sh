#!/bin/bash

# Cleanup script for droplet environment
# This script removes deprecated nginx configuration and prepares for Caddy setup

set -e  # Exit on any error

echo "🧹 Starting droplet cleanup process..."

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    echo "⚠️ Running as root. This is fine for cleanup operations."
fi

echo "📋 This script will:"
echo "  1. Stop and remove nginx"
echo "  2. Remove nginx configuration files"
echo "  3. Stop any existing portfolio containers"
echo "  4. Clean up old Docker images and containers"
echo "  5. Remove old SSL certificates"
echo "  6. Prepare for new Caddy-based setup"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo "🛑 Step 1: Stopping and removing nginx..."

# Stop nginx service
if systemctl is-active --quiet nginx; then
    echo "   Stopping nginx service..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
else
    echo "   nginx service not running"
fi

# Remove nginx
if command -v nginx &> /dev/null; then
    echo "   Removing nginx package..."
    sudo apt remove --purge nginx nginx-common nginx-core -y
    sudo apt autoremove -y
else
    echo "   nginx package not found"
fi

echo "🗑️ Step 2: Removing nginx configuration files..."

# Remove nginx configuration
if [ -d "/etc/nginx" ]; then
    echo "   Removing /etc/nginx directory..."
    sudo rm -rf /etc/nginx
fi

# Remove nginx logs
if [ -d "/var/log/nginx" ]; then
    echo "   Removing nginx logs..."
    sudo rm -rf /var/log/nginx
fi

# Remove nginx cache
if [ -d "/var/cache/nginx" ]; then
    echo "   Removing nginx cache..."
    sudo rm -rf /var/cache/nginx
fi

echo "🐳 Step 3: Cleaning up Docker containers and images..."

# Stop all running containers
echo "   Stopping all running containers..."
docker stop $(docker ps -aq) 2>/dev/null || echo "   No containers to stop"

# Remove all containers
echo "   Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || echo "   No containers to remove"

# Remove all images
echo "   Removing all Docker images..."
docker rmi $(docker images -q) 2>/dev/null || echo "   No images to remove"

# Remove all volumes
echo "   Removing all Docker volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || echo "   No volumes to remove"

# Remove all networks (except default)
echo "   Removing custom Docker networks..."
docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || echo "   No custom networks to remove"

# Clean up Docker system
echo "   Cleaning up Docker system..."
docker system prune -af --volumes

echo "🔒 Step 4: Removing old SSL certificates..."

# Remove Let's Encrypt certificates (if using certbot)
if [ -d "/etc/letsencrypt" ]; then
    echo "   Removing Let's Encrypt certificates..."
    sudo rm -rf /etc/letsencrypt
fi

# Remove certbot
if command -v certbot &> /dev/null; then
    echo "   Removing certbot..."
    sudo apt remove --purge certbot python3-certbot-nginx -y
    sudo apt autoremove -y
fi

echo "📁 Step 5: Cleaning up old project files..."

# Remove old portfolio directory if it exists
if [ -d "/opt/portfolio" ]; then
    echo "   Backing up and removing old portfolio directory..."
    sudo mv /opt/portfolio /opt/portfolio.backup.$(date +%Y%m%d_%H%M%S)
fi

# Remove old reverse-proxy directory if it exists
if [ -d "/opt/reverse-proxy" ]; then
    echo "   Backing up and removing old reverse-proxy directory..."
    sudo mv /opt/reverse-proxy /opt/reverse-proxy.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "🔧 Step 6: Preparing for new setup..."

# Create fresh directories
echo "   Creating fresh directories..."
sudo mkdir -p /opt/portfolio
sudo mkdir -p /opt/reverse-proxy

# Set proper permissions
echo "   Setting proper permissions..."
sudo chown -R $USER:$USER /opt/portfolio
sudo chown -R $USER:$USER /opt/reverse-proxy

# Ensure Docker is running
echo "   Ensuring Docker is running..."
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group if not already
if ! groups $USER | grep -q docker; then
    echo "   Adding user to docker group..."
    sudo usermod -aG docker $USER
    echo "   ⚠️ You may need to log out and back in for docker group changes to take effect"
fi

echo "🧹 Step 7: Final cleanup..."

# Clean up package cache
echo "   Cleaning up package cache..."
sudo apt clean
sudo apt autoclean

# Update package list
echo "   Updating package list..."
sudo apt update

echo ""
echo "✅ Cleanup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Log out and back in (if you were added to docker group)"
echo "2. Clone your repository: git clone <your-repo-url> /opt/portfolio"
echo "3. Set up GitHub Secrets in your repository"
echo "4. Push changes to trigger automated deployment"
echo ""
echo "📁 Backup directories created:"
echo "   - /opt/portfolio.backup.YYYYMMDD_HHMMSS"
echo "   - /opt/reverse-proxy.backup.YYYYMMDD_HHMMSS"
echo ""
echo "🎉 Your droplet is now ready for the new Caddy-based setup!"
