# Portfolio Deployment Guide

## Prerequisites

### On Your Droplet (2GB RAM, 25GB Disk)
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

## Initial Server Setup

### 0. Clean Up Existing Setup (IMPORTANT)

If you have an existing nginx-based setup, you **MUST** clean it up first to prevent conflicts:

```bash
# Run the cleanup script to remove nginx and old configurations
./cleanup-droplet.sh
```

**⚠️ Warning**: This will remove nginx, old SSL certificates, and Docker containers. Make sure to backup any important data first.

### 1. Install Docker and Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group changes
```

### 2. Verify Docker Installation
```bash
# Test Docker installation
docker --version
docker-compose --version

# Test Docker without sudo (if user was added to docker group)
docker run hello-world
```

## Deployment Steps

### 1. Clone Your Repository
```bash
cd /opt
sudo git clone https://github.com/yourusername/portfolio.git
sudo chown -R $USER:$USER /opt/portfolio
cd /opt/portfolio
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit the environment file with your settings
nano .env
```

Required environment variables:
- `DJANGO_SECRET_KEY`: Generate a secure secret key
- `DJANGO_DEBUG=False`: Always False for production

### 3. Build and Start the Container
```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# Check if the container is running
docker-compose ps
docker-compose logs -f
```

### 4. Set Up Reverse Proxy (Caddy)

The reverse proxy is now handled automatically by Caddy through Docker. No manual nginx configuration needed!

The Caddy reverse proxy will:
- **Automatically handle HTTPS** with Let's Encrypt certificates
- **Route traffic** to your portfolio container
- **Provide security headers** and compression
- **Handle SSL certificate renewal** automatically

## Resource Management

### Memory Optimization
Your droplet has only 2GB RAM, so the container is limited to 1.5GB. Monitor usage:
```bash
# Check container resource usage
docker stats portfolio-app

# Check system memory
free -h
```

### Disk Space Management
With only 25GB disk space:
```bash
# Clean up Docker images and containers
docker system prune -a

# Monitor disk usage
df -h

# Clean up old logs
docker-compose logs --tail=1000 > recent_logs.txt
docker-compose logs --since=24h > daily_logs.txt
```

## Maintenance Commands

### Update Application
```bash
cd /opt/portfolio
git pull origin main
docker-compose build
docker-compose up -d
```

### View Logs
```bash
# Application logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Database
```bash
# Create backup
docker-compose exec portfolio python manage.py dumpdata > backup_$(date +%Y%m%d_%H%M%S).json

# Or copy the SQLite file
cp /opt/portfolio/db.sqlite3 backup_$(date +%Y%m%d_%H%M%S).sqlite3
```

### Restart Services
```bash
# Restart just the application
docker-compose restart

# Restart everything
docker-compose down && docker-compose up -d
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Check if port is in use
sudo netstat -tlnp | grep :8000
```

### High Memory Usage
```bash
# Check what's using memory
docker stats
htop

# Restart container to free memory
docker-compose restart
```

### SSL Issues
```bash
# Test SSL configuration
sudo nginx -t
sudo certbot certificates
```

## Security Considerations

1. **Firewall**: Configure UFW to only allow necessary ports
2. **Updates**: Keep the system and Docker images updated
3. **Backups**: Regular backups of database and media files
4. **Monitoring**: Set up basic monitoring for uptime and resource usage

## Performance Tips

1. **Static Files**: Use CDN for static assets if needed
2. **Database**: Consider PostgreSQL for better performance with multiple apps
3. **Caching**: Implement Redis for caching if memory allows
4. **Media Files**: Consider S3 for large media files to save disk space
