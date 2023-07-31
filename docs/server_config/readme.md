File in this folder are configuration files for the production server. Kept it here for reference.

## daphne or gunicorn
Daphne and gunicorn files are located in /etc/systemd/system

When updating daphne or gunicorn make sure to run:
```bash
sudo systemctl restart gunicorn
sudo systemctl restart daphne
sudo systemctl daemon-reload
```

to check the status of the above daemons run 
```bash
sudo systemctl status gunicorn
sudo systemctl status daphne
```

## ngnix
ngnix file is located in /etc/nginx/sites-available

When making change to nginx make sure to run:
```bash
sudo nginx -t && sudo systemctl restart nginx
```

to see nginx logs run:
```bash
tail -f /var/log/nginx/error.log
```