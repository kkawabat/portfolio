#!/bin/bash
set -e

mkdir -p /app/db_data

python manage.py migrate --noinput
python manage.py collectstatic --noinput --verbosity=0

exec "$@"
