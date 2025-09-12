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
	poetry run python manage.py startapp --template=apps/_app_template $$app_name apps/$$app_name

# target: update - pull changes from github, install changes, collectstatic and restart servers
update:
	git pull
	poetry install --no-cache  # no cache to prevent oom on server
	poetry run python manage.py collectstatic --no-input
	sudo sh -c 'systemctl restart gunicorn;	systemctl restart daphne'

# target: docker-build - Build optimized Docker image
docker-build:
	docker build --target production -t portfolio:latest .

# target: docker-build-optimized - Build size-optimized Docker image
docker-build-optimized:
	docker build -f Dockerfile.optimized --target production -t portfolio:optimized .

# target: docker-analyze - Analyze Docker image size
docker-analyze:
	./scripts/analyze-docker-size.sh portfolio

# target: docker-build-dev - Build development Docker image
docker-build-dev:
	docker build --target builder -t portfolio:dev .

# target: docker-run - Run production Docker container
docker-run:
	docker run -p 8000:8000 portfolio:latest

# target: docker-run-dev - Run development Docker container
docker-run-dev:
	docker run -p 8001:8000 -v $(PWD):/app portfolio:dev

# target: docker-compose-up - Start services with docker-compose
docker-compose-up:
	docker-compose up -d

# target: docker-compose-up-dev - Start development services
docker-compose-up-dev:
	docker-compose --profile dev up -d

# target: docker-clean - Clean up Docker images and containers
docker-clean:
	docker system prune -f
	docker image prune -f
