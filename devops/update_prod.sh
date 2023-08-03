poetry shell
git pull
poetry install
python3 manage.py collectstatic --no-input
