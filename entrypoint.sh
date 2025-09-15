#!/bin/bash
set -e

# Ensure database directory exists and has proper permissions
mkdir -p /app/db_data
chown portfolio:portfolio /app/db_data

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files (in case they weren't collected during build)
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --verbosity=0

# Start the application
echo "🚀 Starting application..."
exec "$@"
