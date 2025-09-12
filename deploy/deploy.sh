#!/bin/bash

# Deployment script for Portfolio Django Application
# Usage: ./deploy/deploy.sh [domain] [email]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"your-email@example.com"}
APP_NAME="portfolio"
APP_DIR="/app"
BACKUP_DIR="/backup"

# Logging
LOG_FILE="/var/log/deploy.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "Starting deployment for domain: $DOMAIN"

# Update system
log "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install required packages
log "Installing required packages..."
apt-get install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    docker.io \
    docker-compose \
    ufw \
    fail2ban \
    htop \
    unzip \
    software-properties-common

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Configure firewall
log "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 8000
ufw allow 8001

# Create application directory
log "Setting up application directory..."
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/gunicorn
mkdir -p /var/log/daphne
mkdir -p /var/run/gunicorn
mkdir -p /var/run/daphne

# Set permissions
chown -R www-data:www-data /var/log/gunicorn
chown -R www-data:www-data /var/log/daphne
chown -R www-data:www-data /var/run/gunicorn
chown -R www-data:www-data /var/run/daphne

# Clone or update application
if [ -d "$APP_DIR/.git" ]; then
    log "Updating existing application..."
    cd $APP_DIR
    git pull origin main
else
    log "Cloning application..."
    cd /
    git clone https://github.com/kkawabat/portfolio.git $APP_DIR
    cd $APP_DIR
fi

# Install Poetry
log "Installing Poetry..."
curl -sSL https://install.python-poetry.org | python3 -

# Configure Poetry
poetry config virtualenvs.create false

# Install dependencies
log "Installing Python dependencies..."
poetry install --only main --no-interaction --no-ansi

# Create environment file
log "Creating environment configuration..."
cat > $APP_DIR/.env << EOF
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DJANGO_ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN
DATABASE_URL=sqlite:///db.sqlite3
EOF

# Set proper permissions
chown -R www-data:www-data $APP_DIR
chmod 600 $APP_DIR/.env

# Run Django migrations
log "Running Django migrations..."
cd $APP_DIR
poetry run python manage.py migrate --noinput

# Collect static files
log "Collecting static files..."
poetry run python manage.py collectstatic --noinput

# Configure Nginx
log "Configuring Nginx..."
cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/$APP_NAME
sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/$APP_NAME
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Install systemd services
log "Installing systemd services..."
cp $APP_DIR/deploy/systemd/*.service /etc/systemd/system/
systemctl daemon-reload

# Enable and start services
systemctl enable portfolio.service
systemctl enable daphne.service
systemctl start portfolio.service
systemctl start daphne.service

# Start Nginx
systemctl enable nginx
systemctl start nginx

# Get SSL certificate
log "Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Configure automatic SSL renewal
log "Configuring SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Configure log rotation
log "Configuring log rotation..."
cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/gunicorn/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload portfolio.service
    endscript
}

/var/log/daphne/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload daphne.service
    endscript
}
EOF

# Create backup script
log "Creating backup script..."
cat > /usr/local/bin/backup-$APP_NAME << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup"
APP_DIR="/app"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

tar -czf "$BACKUP_FILE" -C "$APP_DIR" .
echo "Backup created: $BACKUP_FILE"
EOF

chmod +x /usr/local/bin/backup-$APP_NAME

# Create update script
log "Creating update script..."
cat > /usr/local/bin/update-$APP_NAME << 'EOF'
#!/bin/bash
APP_DIR="/app"
cd "$APP_DIR"

# Backup before update
/usr/local/bin/backup-portfolio

# Pull latest changes
git pull origin main

# Install dependencies
poetry install --only main --no-interaction --no-ansi

# Run migrations
poetry run python manage.py migrate --noinput

# Collect static files
poetry run python manage.py collectstatic --noinput

# Restart services
systemctl restart portfolio.service
systemctl restart daphne.service

echo "Application updated successfully!"
EOF

chmod +x /usr/local/bin/update-$APP_NAME

# Final status check
log "Performing final status check..."
systemctl is-active --quiet portfolio.service && log "Portfolio service is running" || error "Portfolio service failed to start"
systemctl is-active --quiet daphne.service && log "Daphne service is running" || error "Daphne service failed to start"
systemctl is-active --quiet nginx && log "Nginx is running" || error "Nginx failed to start"

log "Deployment completed successfully!"
log "Your application should be available at: https://$DOMAIN"
log ""
log "Useful commands:"
log "  Check status: systemctl status portfolio.service"
log "  View logs: journalctl -u portfolio.service -f"
log "  Update app: update-portfolio"
log "  Create backup: backup-portfolio"
log "  Restart services: systemctl restart portfolio.service daphne.service" 