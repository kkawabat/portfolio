#!/bin/bash

# Generate Caddyfile from template with environment variables
# This script creates a secure Caddyfile without exposing sensitive information

set -e

echo "🔧 Generating Caddyfile from template..."

# Check if template exists
if [ ! -f "Caddyfile.template" ]; then
    echo "❌ Caddyfile.template not found!"
    exit 1
fi

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env file..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

# Set default values if environment variables are not set
DOMAIN=${DOMAIN:-"localhost"}
CADDY_EMAIL=${CADDY_EMAIL:-"admin@example.com"}
PORTFOLIO_CONTAINER=${PORTFOLIO_CONTAINER:-"portfolio"}
PORTFOLIO_PORT=${PORTFOLIO_PORT:-"8000"}
AUTO_HTTPS=${AUTO_HTTPS:-"on"}
LOG_LEVEL=${LOG_LEVEL:-"INFO"}
ADMIN_API=${ADMIN_API:-"off"}

# Set values for HTTPS (hardcoded for simplicity)
HSTS_HEADER="Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\""
REDIRECT_PROTOCOL="https"

# Optional subdomain configurations
API_SUBDOMAIN=${API_SUBDOMAIN:-"api"}
API_CONTAINER=${API_CONTAINER:-"api-container"}
API_PORT=${API_PORT:-"8080"}
APP_SUBDOMAIN=${APP_SUBDOMAIN:-"app"}
APP_CONTAINER=${APP_CONTAINER:-"app-container"}
APP_PORT=${APP_PORT:-"8080"}

echo "📋 Using configuration:"
echo "  Domain: $DOMAIN"
echo "  Email: $CADDY_EMAIL"
echo "  Portfolio: $PORTFOLIO_CONTAINER:$PORTFOLIO_PORT"
echo "  Auto HTTPS: $AUTO_HTTPS"
echo "  Log Level: $LOG_LEVEL"
echo "  Admin API: $ADMIN_API"

# Generate Caddyfile from template
envsubst < Caddyfile.template > Caddyfile

# Add subdomain configurations if they exist
if [ -f "subdomains.conf" ] && [ -s "subdomains.conf" ]; then
    echo "🔧 Adding subdomain configurations..."
    
    # Create temporary file for subdomain blocks
    temp_file=$(mktemp)
    
    # Filter out comments and empty lines, then generate subdomain blocks
    grep -v '^#' subdomains.conf | grep -v '^$' | grep '=' | while IFS='=' read -r subdomain container_port; do
        # Check if WebSocket is enabled
        if [[ "$container_port" == *":websocket" ]]; then
            # Remove :websocket suffix for actual container:port
            actual_port="${container_port%:websocket}"
            websocket_enabled=true
        else
            actual_port="$container_port"
            websocket_enabled=false
        fi
        
        cat >> "$temp_file" << EOF

# Subdomain: $subdomain
$subdomain.$DOMAIN {
EOF
        
        # Force HTTP/1.1 for WebSocket connections if enabled
        if [ "$websocket_enabled" = true ]; then
            cat >> "$temp_file" << EOF
    # CRITICAL: Force HTTP/1.1 for WebSocket connections
    # HTTP/2 does not support WebSocket upgrades
    # Use the correct Caddy syntax to disable HTTP/2
    protocols h1
    
EOF
        fi
        
        cat >> "$temp_file" << EOF
    reverse_proxy $actual_port {
        health_uri /health
        health_interval 30s
        health_timeout 10s
EOF
        
        # Add WebSocket-specific configuration if enabled
        if [ "$websocket_enabled" = true ]; then
            cat >> "$temp_file" << EOF
        
        # WebSocket support - Caddy automatically handles WebSocket upgrades
        # when it detects the proper headers, but we can be explicit about it
        
        # Ensure WebSocket headers are properly forwarded
        header_up Connection {>Connection}
        header_up Upgrade {>Upgrade}
        header_up Sec-WebSocket-Key {>Sec-WebSocket-Key}
        header_up Sec-WebSocket-Version {>Sec-WebSocket-Version}
        header_up Sec-WebSocket-Protocol {>Sec-WebSocket-Protocol}
        header_up Sec-WebSocket-Extensions {>Sec-WebSocket-Extensions}
        
        # Standard proxy headers for WebSocket connections
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
EOF
        fi
        
        cat >> "$temp_file" << EOF
    }
    
    # Logging
    log {
        output file /var/log/caddy/${subdomain}.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        format json
    }
}
EOF
    done
    
    # Append subdomain configurations to Caddyfile
    if [ -s "$temp_file" ]; then
        cat "$temp_file" >> Caddyfile
        echo "✅ Added $(grep -c '^[a-zA-Z0-9_-]*=' subdomains.conf) subdomain configurations"
    fi
    
    # Clean up temporary file
    rm -f "$temp_file"
else
    echo "ℹ️ No subdomain configurations found"
fi

echo "✅ Caddyfile generated successfully!"

# Format and validate the generated Caddyfile
if command -v caddy &> /dev/null; then
    echo "🔍 Formatting and validating generated Caddyfile..."
    
    # Format the Caddyfile
    if caddy fmt --overwrite Caddyfile; then
        echo "✅ Caddyfile formatted successfully!"
    else
        echo "⚠️ Caddyfile formatting failed, but continuing..."
    fi
    
    # Validate the Caddyfile
    if caddy validate --config Caddyfile --adapter caddyfile; then
        echo "✅ Caddyfile validation passed!"
    else
        echo "❌ Caddyfile validation failed!"
        exit 1
    fi
else
    echo "⚠️ Caddy not found, skipping formatting and validation"
fi

echo "🎉 Caddyfile generation completed!"
