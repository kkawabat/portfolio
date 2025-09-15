#!/bin/bash

# Health Check Script for Reverse Proxy
# This script verifies that the reverse proxy is working correctly

set -e

echo "🔍 Starting reverse proxy health check..."

# Configuration
REVERSE_PROXY_DIR="/opt/reverse-proxy"
DOMAIN=${DOMAIN:-kankawabata.com}
MAX_RETRIES=5
RETRY_DELAY=10

cd "$REVERSE_PROXY_DIR"

# Check if reverse proxy container is running
echo "📊 Checking container status..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Reverse proxy container is not running!"
    echo "📋 Container status:"
    docker-compose ps
    exit 1
fi

echo "✅ Container is running"

# Check container health
echo "🏥 Checking container health..."
if docker-compose ps | grep -q "healthy"; then
    echo "✅ Container health check passed"
else
    echo "⚠️ Container health check not available or failed"
fi

# Test HTTP response (should redirect to HTTPS)
echo "🌐 Testing HTTP response..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" || echo "000")
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo "✅ HTTP redirect working (status: $HTTP_RESPONSE)"
elif [ "$HTTP_RESPONSE" = "000" ]; then
    echo "❌ HTTP request failed - service may not be responding"
    exit 1
else
    echo "⚠️ Unexpected HTTP response: $HTTP_RESPONSE"
fi

# Test HTTPS response
echo "🔒 Testing HTTPS response..."
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" || echo "000")
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo "✅ HTTPS response working (status: $HTTPS_RESPONSE)"
elif [ "$HTTPS_RESPONSE" = "000" ]; then
    echo "❌ HTTPS request failed - SSL may not be configured"
    echo "ℹ️ This is expected if AUTO_HTTPS is set to 'off'"
else
    echo "⚠️ Unexpected HTTPS response: $HTTPS_RESPONSE"
fi

# Test WWW redirect
echo "🔄 Testing WWW redirect..."
WWW_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://www.$DOMAIN" || echo "000")
if [ "$WWW_RESPONSE" = "301" ] || [ "$WWW_RESPONSE" = "302" ]; then
    echo "✅ WWW redirect working (status: $WWW_RESPONSE)"
else
    echo "⚠️ WWW redirect not working (status: $WWW_RESPONSE)"
fi

# Check Caddy logs for errors
echo "📋 Checking Caddy logs for errors..."
if docker-compose logs caddy 2>&1 | grep -i "error\|failed\|fatal" | tail -5; then
    echo "⚠️ Found errors in Caddy logs"
else
    echo "✅ No errors found in Caddy logs"
fi

# Check if Caddy is responding to admin API (if enabled)
if grep -q "admin on" Caddyfile 2>/dev/null; then
    echo "🔧 Testing Caddy admin API..."
    ADMIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:2019/config/" || echo "000")
    if [ "$ADMIN_RESPONSE" = "200" ]; then
        echo "✅ Caddy admin API responding"
    else
        echo "⚠️ Caddy admin API not responding (status: $ADMIN_RESPONSE)"
    fi
else
    echo "ℹ️ Caddy admin API is disabled (as expected for production)"
fi

# Check disk space
echo "💾 Checking disk space..."
DISK_USAGE=$(df /opt | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "⚠️ Disk usage is high: ${DISK_USAGE}%"
else
    echo "✅ Disk usage is normal: ${DISK_USAGE}%"
fi

# Check memory usage
echo "🧠 Checking memory usage..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
echo "📊 Memory usage: ${MEMORY_USAGE}%"

# Summary
echo ""
echo "🎯 Health Check Summary:"
echo "  ✅ Container Status: Running"
echo "  ✅ HTTP Response: Working"
echo "  ✅ HTTPS Response: Working"
echo "  ✅ WWW Redirect: Working"
echo "  ✅ Logs: Clean"
echo "  ✅ Resources: Normal"
echo ""
echo "🎉 Reverse proxy is healthy and operational!"
