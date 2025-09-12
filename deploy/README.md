# DigitalOcean Deployment Guide

This guide will help you deploy your Django Portfolio application to a DigitalOcean droplet.

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Domain Name**: Point your domain to your droplet's IP address
3. **SSH Key**: Set up SSH key authentication for secure access

## Step 1: Create a DigitalOcean Droplet

1. Log into your DigitalOcean account
2. Click "Create" → "Droplets"
3. Choose configuration:
   - **Distribution**: Ubuntu 22.04 LTS
   - **Plan**: Basic (at least 2GB RAM, 1 vCPU)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `portfolio-server` (or your preferred name)

4. Click "Create Droplet"

## Step 2: Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## Step 3: Run the Deployment Script

1. **Clone your repository** (if not already done):
```bash
git clone https://github.com/kkawabat/portfolio.git /app
cd /app
```

2. **Make the deployment script executable**:
```bash
chmod +x deploy/deploy.sh
```

3. **Run the deployment script**:
```bash
./deploy/deploy.sh your-domain.com your-email@example.com
```

Replace:
- `your-domain.com` with your actual domain
- `your-email@example.com` with your email for SSL certificates

## What the Deployment Script Does

The deployment script automatically:

- ✅ Updates the system
- ✅ Installs required packages (Nginx, Docker, Poetry, etc.)
- ✅ Configures firewall (UFW)
- ✅ Sets up the application directory
- ✅ Installs Python dependencies
- ✅ Configures Nginx with SSL
- ✅ Sets up systemd services
- ✅ Obtains SSL certificates via Let's Encrypt
- ✅ Configures automatic SSL renewal
- ✅ Sets up log rotation
- ✅ Creates backup and update scripts

## Step 4: Verify Deployment

After the script completes, check:

1. **Application Status**:
```bash
systemctl status portfolio.service
systemctl status daphne.service
systemctl status nginx
```

2. **Visit your website**: `https://your-domain.com`

3. **Check logs**:
```bash
journalctl -u portfolio.service -f
```

## Step 5: Post-Deployment Configuration

### Environment Variables

Edit `/app/.env` to configure your application:

```bash
nano /app/.env
```

Add your specific configuration:

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-secret-key
DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=sqlite:///db.sqlite3
# Add other environment variables as needed
```

### Database Setup

If you need to create a superuser:

```bash
cd /app
poetry run python manage.py createsuperuser
```

## Useful Commands

### Application Management

```bash
# Check application status
systemctl status portfolio.service

# View application logs
journalctl -u portfolio.service -f

# Restart application
systemctl restart portfolio.service

# Update application
update-portfolio

# Create backup
backup-portfolio
```

### Nginx Management

```bash
# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### SSL Certificate Management

```bash
# Check SSL certificate status
certbot certificates

# Renew SSL certificates manually
certbot renew

# View SSL renewal logs
journalctl -u certbot.timer
```

## Monitoring and Maintenance

### System Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep portfolio
```

### Log Monitoring

```bash
# Application logs
tail -f /var/log/gunicorn/error.log
tail -f /var/log/daphne/error.log

# System logs
journalctl -f

# Nginx logs
tail -f /var/log/nginx/access.log
```

### Backup Strategy

The deployment script creates automatic backups. To manually create a backup:

```bash
backup-portfolio
```

Backups are stored in `/backup/` directory.

## Troubleshooting

### Common Issues

1. **Application not starting**:
```bash
systemctl status portfolio.service
journalctl -u portfolio.service -f
```

2. **Nginx configuration errors**:
```bash
nginx -t
systemctl status nginx
```

3. **SSL certificate issues**:
```bash
certbot certificates
certbot renew --dry-run
```

4. **Permission issues**:
```bash
chown -R www-data:www-data /app
chmod 600 /app/.env
```

### Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Configure caching** for static files
3. **Monitor resource usage** with `htop`
4. **Set up monitoring** with tools like Prometheus/Grafana

## Security Considerations

- ✅ Firewall configured (UFW)
- ✅ SSH key authentication
- ✅ SSL/TLS encryption
- ✅ Automatic security updates
- ✅ Fail2ban protection
- ✅ Non-root user for application

## Scaling Considerations

For high traffic:

1. **Increase droplet size** (more RAM/CPU)
2. **Add load balancer**
3. **Use managed database** (PostgreSQL/MySQL)
4. **Implement CDN** for static files
5. **Add caching layer** (Redis)

## Support

If you encounter issues:

1. Check the logs: `journalctl -u portfolio.service -f`
2. Verify configuration files
3. Check system resources
4. Review this documentation

For additional help, check the Django and DigitalOcean documentation. 