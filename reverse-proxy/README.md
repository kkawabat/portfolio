# Reverse Proxy Setup with Caddy

This folder contains a self-contained reverse proxy setup using Caddy for automatic HTTPS and traffic routing to your Docker containers.

## Folder Structure

```
reverse-proxy/
├── Caddyfile              # Caddy configuration
├── docker-compose.yml     # Docker Compose for Caddy
├── logs/                  # Log files (created automatically)
└── README.md             # This file
```

## Features

- **Automatic HTTPS** with Let's Encrypt certificates
- **Security headers** for enhanced protection
- **Health checks** for backend services
- **Logging** with rotation
- **Resource limits** optimized for small droplets
- **Network connectivity** to other Docker projects

## Setup Instructions

### Option 1: Automated Setup (Recommended)

The reverse proxy can be automatically deployed using GitHub Actions when you push changes to the `reverse-proxy/` folder.

**Prerequisites:**
- GitHub Secrets configured (see `GITHUB_SECRETS.md`)
- Portfolio repository cloned to `/opt/portfolio` on your droplet

**Deployment:**
1. Push changes to the `reverse-proxy/` folder
2. GitHub Actions will automatically deploy to your droplet
3. Check the Actions tab in your GitHub repository for deployment status

### Option 2: Manual Setup

#### 1. Move to Root Directory

After cloning the portfolio repository to your droplet, move this folder to the root:

```bash
# On your droplet
cd /opt/portfolio
sudo cp -r reverse-proxy /opt/
cd /opt/reverse-proxy
```

#### 2. Run Setup Script

```bash
# Run the automated setup script
./setup.sh
```

#### 3. Configure Domains

Edit the `Caddyfile` to match your domains:

```caddy
# Main portfolio
mydomain.com {
    reverse_proxy portfolio:8000
}

# Other projects
api.mydomain.com {
    reverse_proxy other-project:8080
}
```

#### 4. Update Email

Change the email in both files to your email address:

- `Caddyfile`: Line with `email your-email@domain.com`
- `.env` file: `CADDY_EMAIL=your-email@domain.com`

#### 5. Start the Reverse Proxy

```bash
cd /opt/reverse-proxy
docker-compose up -d
```

#### 6. Verify Setup

```bash
# Check if Caddy is running
docker-compose ps

# Check logs
docker-compose logs -f

# Test HTTPS
curl -I https://mydomain.com
```

## Network Configuration

### Connecting Other Projects

To connect other Docker projects to the reverse proxy, add this to their `docker-compose.yml`:

```yaml
networks:
  portfolio_default:
    external: true
```

And add the network to your services:

```yaml
services:
  your-app:
    # ... other config
    networks:
      - portfolio_default
```

### Example Project Structure

```
~/
├── portfolio/
│   ├── .env
│   ├── docker-compose.yml
│   └── ...
├── other-project/
│   ├── .env
│   ├── docker-compose.yml
│   └── ...
└── reverse-proxy/
    ├── Caddyfile
    ├── docker-compose.yml
    └── logs/
```

## Domain Configuration

### Adding New Domains

1. **Edit Caddyfile**:
   ```caddy
   newdomain.com {
       reverse_proxy container-name:port
   }
   ```

2. **Reload Caddy**:
   ```bash
   docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
   ```

### Subdomain Examples

```caddy
# API service
api.mydomain.com {
    reverse_proxy api-container:3000
}

# Admin panel
admin.mydomain.com {
    reverse_proxy admin-container:8080
}

# Static site
blog.mydomain.com {
    reverse_proxy blog-container:80
}
```

## Security Features

### Automatic Security Headers

The Caddyfile includes:
- **HSTS** (HTTP Strict Transport Security)
- **X-Frame-Options** (clickjacking protection)
- **X-XSS-Protection** (XSS protection)
- **X-Content-Type-Options** (MIME sniffing protection)
- **Content Security Policy** (CSP)
- **Referrer Policy**

### SSL/TLS

- **Automatic HTTPS** with Let's Encrypt
- **HTTP to HTTPS redirect**
- **Modern TLS configuration**

## Monitoring and Logs

### View Logs

```bash
# Real-time logs
docker-compose logs -f

# Log files
tail -f logs/portfolio.log
```

### Health Checks

Caddy automatically checks backend health:
- **Health endpoint**: `/health`
- **Check interval**: 30 seconds
- **Timeout**: 10 seconds

## Troubleshooting

### Common Issues

1. **Certificate Issues**
   ```bash
   # Check certificate status
   docker-compose exec caddy caddy list-certificates
   
   # Force certificate renewal
   docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile
   ```

2. **Network Connectivity**
   ```bash
   # Check if containers can communicate
   docker network ls
   docker network inspect portfolio_default
   ```

3. **Port Conflicts**
   ```bash
   # Check what's using ports 80/443
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :443
   ```

### Manual Certificate Management

```bash
# List certificates
docker-compose exec caddy caddy list-certificates

# Reload configuration
docker-compose exec caddy caddy reload

# Validate configuration
docker-compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

## Performance Optimization

### Resource Limits

The setup includes resource limits optimized for small droplets:
- **Memory limit**: 256MB
- **CPU limit**: 0.5 cores
- **Log rotation**: 100MB files, keep 5, retain for 30 days

### Caching

For better performance, consider adding caching:

```caddy
mydomain.com {
    # Cache static files
    @static {
        path *.css *.js *.png *.jpg *.jpeg *.gif *.ico *.svg
    }
    header @static Cache-Control "public, max-age=31536000"
    
    reverse_proxy portfolio:8000
}
```

## Backup and Maintenance

### Backup Certificates

```bash
# Backup Caddy data
docker run --rm -v reverse-proxy_caddy_data:/data -v $(pwd):/backup alpine tar czf /backup/caddy-data-backup.tar.gz -C /data .
```

### Update Caddy

```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

## GitHub Actions Integration

### Automated Deployment

The reverse proxy has its own GitHub Actions workflow (`.github/workflows/deploy-reverse-proxy.yml`) that automatically deploys when you push changes to the `reverse-proxy/` folder.

**Features:**
- **Path-based triggering**: Only runs when `reverse-proxy/` files change
- **Caddyfile validation**: Validates syntax before deployment
- **Automatic setup**: Handles file copying, permissions, and configuration
- **Health checks**: Verifies deployment success
- **Rollback capability**: Backs up existing configuration

**Required GitHub Secrets:**
- `DROPLET_HOST` - Your droplet IP/domain
- `DROPLET_USER` - SSH username
- `DROPLET_SSH_KEY` - Private SSH key
- `DROPLET_PORT` - SSH port (optional, defaults to 22)
- `CADDY_EMAIL` - Email for Let's Encrypt certificates

### Manual Workflow Trigger

You can also manually trigger the deployment:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Deploy Reverse Proxy" workflow
4. Click "Run workflow"

### Workflow Steps

1. **Validation**: Checks Caddyfile syntax
2. **Deployment**: Copies files, sets permissions, starts containers
3. **Verification**: Tests HTTP/HTTPS responses and health checks
4. **Notification**: Reports deployment status
