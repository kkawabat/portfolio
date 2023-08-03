sudo -u username poetry shell
sudo -u username git pull
sudo -u username poetry install
sudo -u username python3 manage.py collectstatic --no-input
systemctl restart gunicorn
systemctl restart daphne
