# Reboot Recovery - Simple Setup

Your website will automatically start after a server reboot using Docker's built-in restart policies.

## How It Works

1. **Server boots** → Docker starts automatically (systemd service)
2. **Docker starts** → Containers with `restart: unless-stopped` automatically restart
3. **All services running** → Website is accessible

## Current Configuration

### Docker Service
- **Status**: Enabled for automatic startup
- **Check**: `systemctl is-enabled docker` (should show "enabled")

### Container Restart Policies
- **Portfolio**: `restart: unless-stopped` in docker-compose.yml
- **Reverse Proxy**: `restart: unless-stopped` in docker-compose.yml

## Testing Reboot Recovery

### Quick Test
```bash
# Check if services are running
docker-compose -f /opt/portfolio/docker-compose.yml ps
docker-compose -f /opt/reverse-proxy/docker-compose.yml ps

# Test website accessibility
curl -I http://kankawabata.com
```

### Simulate Reboot
```bash
# Stop all containers
docker-compose -f /opt/portfolio/docker-compose.yml down
docker-compose -f /opt/reverse-proxy/docker-compose.yml down

# Restart Docker (simulates reboot)
sudo systemctl restart docker

# Wait a moment, then check if containers restarted
sleep 10
docker ps
```

### Actual Reboot Test
```bash
# Reboot the server
sudo reboot

# After reboot, SSH back in and check
ssh kankawabata
docker ps
curl -I http://kankawabata.com
```

## Troubleshooting

### If Services Don't Start After Reboot

1. **Check Docker status**:
   ```bash
   systemctl status docker
   ```

2. **Check if Docker is enabled**:
   ```bash
   systemctl is-enabled docker
   ```

3. **Check container status**:
   ```bash
   docker ps -a
   ```

4. **Check container logs**:
   ```bash
   docker logs portfolio-app
   docker logs reverse-proxy
   ```

### Manual Recovery
If automatic startup fails, manually start services:

```bash
# Start portfolio
cd /opt/portfolio
docker-compose up -d

# Start reverse proxy
cd /opt/reverse-proxy
docker-compose up -d
```

## Why This Simple Approach Works

- **Docker's restart policies** are reliable and well-tested
- **No complex dependencies** to manage
- **Fewer moving parts** means fewer things that can break
- **Docker handles the startup order** automatically

## Monitoring

```bash
# Check all container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check website accessibility
curl -I http://kankawabata.com

# Check container health
docker exec portfolio-app python -c "import requests; print(requests.get('http://localhost:8000', timeout=5).status_code)"
```
