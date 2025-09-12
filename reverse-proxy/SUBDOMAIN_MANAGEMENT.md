# Subdomain Management Guide

This guide explains how to manage subdomain configurations for your reverse proxy without modifying the repository or losing configurations during deployments.

## 🎯 Overview

The subdomain management system allows you to:
- **Add/remove subdomains** without touching the repository
- **Persist configurations** across deployments
- **Automatically generate** Caddyfile configurations
- **Manage multiple projects** on different subdomains

## 📁 Files

### **`subdomains.conf`** - Configuration File
- **Persistent storage** for subdomain configurations
- **Not committed** to repository (gitignored)
- **Simple format**: `subdomain=container:port`

### **`manage-subdomains.sh`** - Management Script
- **Interactive script** for managing subdomains
- **Automatic Caddyfile generation** and reload
- **Validation** and error checking

## 🚀 Quick Start

### 1. Add a Subdomain
```bash
cd /opt/reverse-proxy
./manage-subdomains.sh add api api-container:8080
```

### 2. List All Subdomains
```bash
./manage-subdomains.sh list
```

### 3. Remove a Subdomain
```bash
./manage-subdomains.sh remove api
```

## 📋 Commands

### **Add Subdomain**
```bash
./manage-subdomains.sh add <subdomain> <container:port>
```

**Examples:**
```bash
# API service
./manage-subdomains.sh add api api-container:8080

# Admin panel
./manage-subdomains.sh add admin admin-panel:3000

# Blog
./manage-subdomains.sh add blog blog-app:80

# Documentation
./manage-subdomains.sh add docs documentation:4000
```

### **Remove Subdomain**
```bash
./manage-subdomains.sh remove <subdomain>
```

**Examples:**
```bash
./manage-subdomains.sh remove api
./manage-subdomains.sh remove admin
```

### **List Subdomains**
```bash
./manage-subdomains.sh list
```

**Output:**
```
📋 Configured Subdomains:
Domain: mydomain.com

Subdomain Configurations:
┌─────────────┬─────────────────────┬─────────────────────────┐
│ Subdomain   │ Container:Port      │ Full URL                │
├─────────────┼─────────────────────┼─────────────────────────┤
│ api         │ api-container:8080  │ https://api.mydomain.com │
│ admin       │ admin-panel:3000    │ https://admin.mydomain.com │
│ blog        │ blog-app:80         │ https://blog.mydomain.com │
└─────────────┴─────────────────────┴─────────────────────────┘
```

### **Generate Caddyfile**
```bash
./manage-subdomains.sh generate
```

### **Reload Caddy**
```bash
./manage-subdomains.sh reload
```

## 🔧 Configuration Format

### **`subdomains.conf` Format**
```bash
# Comments start with #
# Format: subdomain=container:port

# API service
api=api-container:8080

# Admin panel
admin=admin-panel:3000

# Blog
blog=blog-app:80

# Documentation
docs=documentation:4000
```

### **Generated Caddyfile Blocks**
Each subdomain generates a Caddyfile block like this:
```caddy
# Subdomain: api
api.mydomain.com {
    reverse_proxy api-container:8080 {
        health_uri /health
        health_interval 30s
        health_timeout 10s
    }
    
    # Logging
    log {
        output file /var/log/caddy/api.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        format json
    }
}
```

## 🌐 DNS Configuration

### **Required DNS Records**
For each subdomain, you need to create a DNS A record:

```
Type: A
Name: api
Value: YOUR_DROPLET_IP
TTL: 300

Type: A
Name: admin
Value: YOUR_DROPLET_IP
TTL: 300
```

### **Wildcard DNS (Optional)**
You can also use a wildcard DNS record:
```
Type: A
Name: *
Value: YOUR_DROPLET_IP
TTL: 300
```

## 🔄 Workflow

### **Adding a New Project**

1. **Deploy your project** with Docker Compose
2. **Add subdomain configuration**:
   ```bash
   ./manage-subdomains.sh add myapp myapp-container:8080
   ```
3. **Configure DNS** to point to your droplet
4. **Test the subdomain**:
   ```bash
   curl -I https://myapp.mydomain.com
   ```

### **Removing a Project**

1. **Remove subdomain configuration**:
   ```bash
   ./manage-subdomains.sh remove myapp
   ```
2. **Stop the container** (if needed):
   ```bash
   docker-compose down
   ```
3. **Remove DNS record** (optional)

## 🔒 Security Features

### **Automatic Security Headers**
Each subdomain gets the same security headers as the main domain:
- HSTS
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content Security Policy

### **Health Checks**
- **Automatic health monitoring** for each backend
- **Failover capabilities** if backend is down
- **Load balancing** support

### **Logging**
- **Separate log files** for each subdomain
- **Structured JSON logging**
- **Log rotation** (100MB files, keep 5, retain 30 days)

## 🐳 Docker Integration

### **Network Requirements**
Your subdomain containers must be on the same Docker network:
```yaml
# In your project's docker-compose.yml
networks:
  portfolio_default:
    external: true
```

### **Container Naming**
Use consistent container names that match your subdomain configuration:
```yaml
services:
  api-container:
    # ... your configuration
    networks:
      - portfolio_default
```

## 📊 Monitoring

### **Check Subdomain Status**
```bash
# List all subdomains
./manage-subdomains.sh list

# Check Caddy logs
docker-compose logs -f

# Check specific subdomain logs
tail -f logs/api.log
```

### **Health Checks**
```bash
# Test subdomain health
curl -I https://api.mydomain.com/health

# Check container status
docker ps | grep api-container
```

## 🚨 Troubleshooting

### **Common Issues**

#### 1. Subdomain Not Working
```bash
# Check DNS resolution
nslookup api.mydomain.com

# Check if container is running
docker ps | grep api-container

# Check Caddy configuration
docker-compose exec caddy caddy validate --config /etc/caddy/Caddyfile
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
docker-compose exec caddy caddy list-certificates

# Force certificate renewal
docker-compose exec caddy caddy reload
```

#### 3. Container Not Reachable
```bash
# Check network connectivity
docker network inspect portfolio_default

# Test internal connectivity
docker-compose exec caddy ping api-container
```

### **Debug Commands**
```bash
# View generated Caddyfile
cat Caddyfile

# Check subdomain configuration
cat subdomains.conf

# View Caddy logs
docker-compose logs caddy

# Test configuration
./manage-subdomains.sh generate
```

## 🔄 Deployment Integration

### **Automatic Generation**
The subdomain configurations are automatically included when:
- **GitHub Actions** deploys the reverse proxy
- **Manual deployment** runs `generate-caddyfile.sh`
- **Subdomain management** script runs

### **Persistence & Safety**
- **`subdomains.conf`** is not committed to repository
- **Configurations persist** across deployments
- **No data loss** when updating reverse proxy
- **`.env` file is recreated** by GitHub Actions but **`subdomains.conf` is preserved**
- **Manual subdomain changes** are never overwritten by deployments

### **Important: File Separation**
- **`.env` file**: Contains core configuration (domain, email) - **recreated on deployment**
- **`subdomains.conf` file**: Contains subdomain mappings - **never touched by deployments**
- **Your subdomain configurations are safe** from being overwritten

## 📈 Best Practices

### **1. Naming Conventions**
- Use **descriptive subdomain names**: `api`, `admin`, `blog`, `docs`
- Use **consistent container names**: `api-container`, `admin-panel`
- Use **standard ports**: `8080`, `3000`, `80`, `4000`

### **2. Health Endpoints**
- Implement **`/health`** endpoints in your applications
- Return **HTTP 200** for healthy status
- Include **application status** in response

### **3. Logging**
- Monitor **subdomain-specific logs**
- Set up **log aggregation** if needed
- Use **structured logging** in your applications

### **4. Security**
- Use **HTTPS only** (automatic with Caddy)
- Implement **authentication** in your applications
- Monitor **access logs** regularly

## 🎉 Benefits

- **No repository modifications** needed for subdomains
- **Persistent configurations** across deployments
- **Automatic SSL certificates** for all subdomains
- **Centralized management** of all subdomains
- **Easy scaling** to multiple projects
- **Professional setup** with health checks and logging
