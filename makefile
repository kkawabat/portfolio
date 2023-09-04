.PHONY:	all help startapp update

# target: all - Default target. Does nothing.
all:
	@echo "Try 'make help'"

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile

# target: startapp - create a new app with template in apps/_app_template requires argument app_name (e.g. make startapp app_name=<APP_NAME>)
startapp:
	mkdir -p apps/$$app_name
	python manage.py startapp --template=apps/_app_template $$app_name apps/$$app_name

# target: update - pull changes from github, install changes, collectstatic and restart servers
update:
	git pull
	poetry install
	python manage.py collectstatic --no-input
	systemctl restart gunicorn
	systemctl restart daphne

