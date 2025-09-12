# Droplet Setup Guide

This guide covers everything you need to set up your droplet to host your portfolio website with the new Caddy-based reverse proxy system.

## ✅ What You Already Have

- ✅ **GitHub credentials** configured
- ✅ **Repository cloned**
- ✅ **Docker installed**
- ✅ **Caddy installed** (though we'll use Docker Caddy instead)

## 🔧 What You Still Need

### 1. **Docker Compose** (if not already installed)
```bash
# Check if docker-compose is installed
docker-compose --version

# If not installed, install it
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. **User in Docker Group** (if not already done)
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in for changes to take effect
exit
# SSH back in
```

### 3. **GitHub Secrets Configuration**
You need to set up these secrets in your GitHub repository:

#### **Required GitHub Secrets:**
- `DROPLET_HOST` - Your droplet's IP address or domain
- `DROPLET_USER` - Your SSH username (usually `root` or `ubuntu`)
- `DROPLET_SSH_KEY` - Your private SSH key content
- `DROPLET_PORT` - SSH port (usually `22`)
- `DJANGO_SECRET_KEY` - Django secret key
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `CADDY_EMAIL` - Email for Let's Encrypt certificates
- `DOMAIN` - Your domain name

### 4. **Domain DNS Configuration**
Point your domain to your droplet:
```
Type: A
Name: @
Value: YOUR_DROPLET_IP
TTL: 300

Type: A
Name: www
Value: YOUR_DROPLET_IP
TTL: 300
```

## 🚀 Complete Setup Process

### Step 1: Clean Up Existing Setup (if any)
```bash
cd /opt/portfolio
./cleanup-droplet.sh
```

### Step 2: Verify Docker Setup
```bash
# Test Docker
docker --version
docker-compose --version

# Test Docker without sudo
docker run hello-world
```

### Step 3: Set Up GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add each secret from the list above.

### Step 4: Deploy Portfolio
```bash
# Navigate to your repository
cd /opt/portfolio

# Push a change to trigger deployment (or manually trigger)
git add .
git commit -m "Trigger deployment"
git push origin main
```

### Step 5: Set Up Reverse Proxy
```bash
# Move reverse-proxy to root directory
sudo cp -r /opt/portfolio/reverse-proxy /opt/
cd /opt/reverse-proxy

# Run setup script
./setup.sh
```

### Step 6: Configure Domain
```bash
# Edit the .env file with your domain
nano .env

# Set your domain and email
DOMAIN=your-domain.com
CADDY_EMAIL=your-email@domain.com
```

### Step 7: Start Services
```bash
# Start reverse proxy
cd /opt/reverse-proxy
docker-compose up -d

# Check status
docker-compose ps
```

## 🔍 Verification Steps

### 1. Check Portfolio Container
```bash
cd /opt/portfolio
docker-compose ps
docker-compose logs -f
```

### 2. Check Reverse Proxy
```bash
cd /opt/reverse-proxy
docker-compose ps
docker-compose logs -f
```

### 3. Test HTTPS
```bash
# Test your domain
curl -I https://your-domain.com

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## 🐳 Docker Services Overview

### **Portfolio Container**
- **Port**: 8000 (internal)
- **Network**: `portfolio_default`
- **Purpose**: Django application

### **Reverse Proxy Container (Caddy)**
- **Ports**: 80, 443 (external)
- **Network**: `portfolio_default`
- **Purpose**: HTTPS termination, routing, SSL certificates

## 🔧 Troubleshooting

### Common Issues

#### 1. **Docker Permission Denied**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
exit
# SSH back in
```

#### 2. **Port Already in Use**
```bash
# Check what's using ports 80/443
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Kill processes if needed
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

#### 3. **SSL Certificate Issues**
```bash
# Check certificate status
cd /opt/reverse-proxy
docker-compose exec caddy caddy list-certificates

# Force certificate renewal
docker-compose exec caddy caddy reload
```

#### 4. **Container Not Starting**
```bash
# Check logs
docker-compose logs

# Check resource usage
docker stats

# Restart containers
docker-compose restart
```

## 📊 Resource Monitoring

### **Memory Usage**
```bash
# Check memory usage
free -h
docker stats

# Your droplet has 2GB RAM
# Portfolio: limited to 1.5GB
# Reverse proxy: limited to 256MB
```

### **Disk Usage**
```bash
# Check disk usage
df -h

# Clean up Docker if needed
docker system prune -af
```

## 🔒 Security Checklist

- ✅ **Firewall configured** (ports 22, 80, 443 open)
- ✅ **SSH key authentication** (no password auth)
- ✅ **Docker containers** running as non-root
- ✅ **HTTPS only** (automatic redirect)
- ✅ **Security headers** (automatic with Caddy)
- ✅ **Automatic SSL certificates** (Let's Encrypt)

## 🎯 Final Verification

### **1. Portfolio Access**
- ✅ `https://your-domain.com` loads
- ✅ All portfolio features work
- ✅ Static files load correctly

### **2. HTTPS Security**
- ✅ HTTP redirects to HTTPS
- ✅ SSL certificate is valid
- ✅ Security headers present

### **3. Performance**
- ✅ Page load times reasonable
- ✅ No memory issues
- ✅ Containers healthy

## 🚀 Adding Subdomains (Optional)

Once your main site is working, you can add subdomains:

```bash
cd /opt/reverse-proxy

# Add a subdomain
./manage-subdomains.sh add api api-container:8080

# List all subdomains
./manage-subdomains.sh list
```

## 📞 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify GitHub Actions**: Check deployment logs in your repository
3. **Test connectivity**: `curl -I https://your-domain.com`
4. **Check DNS**: `nslookup your-domain.com`

## 🎉 Success!

Once everything is working, you'll have:
- ✅ **Automatic HTTPS** with Let's Encrypt
- ✅ **Professional reverse proxy** with Caddy
- ✅ **Automated deployments** via GitHub Actions
- ✅ **Resource-optimized** setup for your 2GB droplet
- ✅ **Easy subdomain management** for future projects
