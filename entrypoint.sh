#!/bin/bash
set -e

mkdir -p /app/db_data

python manage.py migrate --noinput

exec "$@"
