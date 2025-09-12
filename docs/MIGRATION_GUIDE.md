# Migration Guide: Nginx to Caddy

This guide helps you migrate from the deprecated nginx setup to the new Caddy-based reverse proxy system.

## 🚨 Important: Clean Up Required

Before deploying the new system, you **MUST** clean up the old nginx configuration to prevent conflicts.

## 📋 Pre-Migration Checklist

### 1. Backup Current Setup
```bash
# Create a backup of your current setup
sudo tar -czf droplet-backup-$(date +%Y%m%d).tar.gz /etc/nginx /var/log/nginx /opt/portfolio
```

### 2. Document Current Configuration
```bash
# Save current nginx configuration for reference
sudo cp -r /etc/nginx /tmp/nginx-backup
sudo cp -r /var/log/nginx /tmp/nginx-logs-backup
```

## 🧹 Cleanup Process

### Option 1: Automated Cleanup (Recommended)

Run the provided cleanup script:

```bash
# On your droplet
cd /opt/portfolio
./cleanup-droplet.sh
```

### Option 2: Manual Cleanup

If you prefer to clean up manually:

```bash
# Stop nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Remove nginx
sudo apt remove --purge nginx nginx-common nginx-core -y
sudo apt autoremove -y

# Remove nginx configuration
sudo rm -rf /etc/nginx
sudo rm -rf /var/log/nginx
sudo rm -rf /var/cache/nginx

# Clean up Docker
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi $(docker images -q) 2>/dev/null || true
docker system prune -af --volumes

# Remove old SSL certificates
sudo rm -rf /etc/letsencrypt
sudo apt remove --purge certbot python3-certbot-nginx -y

# Clean up old project files
sudo mv /opt/portfolio /opt/portfolio.backup.$(date +%Y%m%d_%H%M%S)
sudo mv /opt/reverse-proxy /opt/reverse-proxy.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
```

## 🔄 Migration Steps

### 1. Clean Up Droplet
```bash
# Run the cleanup script
./cleanup-droplet.sh
```

### 2. Set Up GitHub Secrets
Configure these secrets in your GitHub repository:

- `DROPLET_HOST` - Your droplet IP/domain
- `DROPLET_USER` - SSH username
- `DROPLET_SSH_KEY` - Private SSH key
- `DROPLET_PORT` - SSH port (optional)
- `DJANGO_SECRET_KEY` - Django secret key
- `YOUTUBE_API_KEY` - YouTube API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `CADDY_EMAIL` - Email for Let's Encrypt
- `DOMAIN` - Your domain name

### 3. Deploy New System
```bash
# Clone the repository
git clone <your-repo-url> /opt/portfolio

# The GitHub Actions will handle the rest automatically
```

### 4. Verify Deployment
```bash
# Check if containers are running
docker ps

# Check reverse proxy logs
cd /opt/reverse-proxy
docker-compose logs -f

# Test HTTPS
curl -I https://your-domain.com
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using ports 80/443
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Kill any processes using these ports
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

#### 2. Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
exit
# SSH back in
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
cd /opt/reverse-proxy
docker-compose exec caddy caddy list-certificates

# Force certificate renewal
docker-compose exec caddy caddy reload
```

#### 4. Network Connectivity
```bash
# Check Docker networks
docker network ls
docker network inspect portfolio_default

# Recreate network if needed
docker network rm portfolio_default
docker network create portfolio_default
```

## 📊 Comparison: Nginx vs Caddy

| Feature | Nginx (Old) | Caddy (New) |
|---------|-------------|-------------|
| **SSL Certificates** | Manual certbot setup | Automatic Let's Encrypt |
| **Configuration** | Complex nginx.conf | Simple Caddyfile |
| **HTTP/2** | Manual configuration | Automatic |
| **Security Headers** | Manual configuration | Built-in |
| **Health Checks** | Manual setup | Built-in |
| **Logging** | Manual configuration | Structured JSON logs |
| **Updates** | Manual certificate renewal | Automatic |

## 🎯 Benefits of Migration

### 1. **Simplified Configuration**
- **Before**: Complex nginx.conf with multiple files
- **After**: Single Caddyfile with clear syntax

### 2. **Automatic HTTPS**
- **Before**: Manual certbot setup and renewal
- **After**: Automatic Let's Encrypt certificates

### 3. **Better Security**
- **Before**: Manual security header configuration
- **After**: Built-in security headers and modern TLS

### 4. **Easier Maintenance**
- **Before**: Manual updates and certificate renewal
- **After**: Automated deployment and certificate management

### 5. **Resource Efficiency**
- **Before**: nginx + certbot + manual processes
- **After**: Single Caddy container with built-in features

## 🔒 Security Improvements

### 1. **Automatic Security Headers**
```caddy
header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Frame-Options "SAMEORIGIN"
    X-XSS-Protection "1; mode=block"
    X-Content-Type-Options "nosniff"
    Content-Security-Policy "default-src 'self'; ..."
}
```

### 2. **Modern TLS Configuration**
- Automatic HTTP/2
- Modern cipher suites
- Perfect Forward Secrecy
- HSTS preload

### 3. **Built-in Health Checks**
- Automatic backend health monitoring
- Failover capabilities
- Load balancing

## 📈 Performance Improvements

### 1. **HTTP/2 by Default**
- Multiplexed connections
- Server push capabilities
- Header compression

### 2. **Automatic Compression**
- Gzip compression
- Brotli support
- Optimized for web content

### 3. **Efficient Resource Usage**
- Single container vs multiple services
- Optimized for small droplets
- Built-in caching

## 🚀 Post-Migration

### 1. **Monitor Performance**
```bash
# Check container resource usage
docker stats

# Monitor logs
cd /opt/reverse-proxy
docker-compose logs -f
```

### 2. **Test All Functionality**
- [ ] HTTPS redirects work
- [ ] SSL certificates are valid
- [ ] All subdomains work
- [ ] Static files are served correctly
- [ ] API endpoints respond

### 3. **Update DNS if Needed**
- Ensure A records point to your droplet
- Update any CNAME records for subdomains

## 📞 Support

If you encounter issues during migration:

1. **Check the logs**: `docker-compose logs -f`
2. **Verify configuration**: `caddy validate --config Caddyfile`
3. **Test connectivity**: `curl -I https://your-domain.com`
4. **Check GitHub Actions**: Review deployment logs in your repository

## 🎉 Success!

Once migration is complete, you'll have:
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Simplified configuration management
- ✅ Better security and performance
- ✅ Automated deployment pipeline
- ✅ Resource-efficient setup optimized for small droplets
