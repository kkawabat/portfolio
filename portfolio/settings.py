from dotenv import load_dotenv
import mimetypes
import os
from pathlib import Path

load_dotenv()

mimetypes.add_type("text/css", ".css", True)
mimetypes.add_type("text/javascript", ".js", True)

BASE_DIR = Path(__file__).resolve().parent.parent

APPEND_SLASH = True

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-c^$=z@s8rfzi^b=$2_^t&bn%1%+#*m9g^zys&_*=&zk8#%g4wq',
)

DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

CLOUDRUN_SERVICE_URL = os.environ.get('CLOUDRUN_SERVICE_URL')
WORKER_SERVICE_URL = os.environ.get('WORKER_SERVICE_URL')
if CLOUDRUN_SERVICE_URL:
    ALLOWED_HOSTS.append(CLOUDRUN_SERVICE_URL.removeprefix('https://'))

CSRF_TRUSTED_ORIGINS = [
    o for o in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if o
]
if CLOUDRUN_SERVICE_URL:
    CSRF_TRUSTED_ORIGINS.append(CLOUDRUN_SERVICE_URL)

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'apps.new_main',
    'apps.magic_eye',
    'apps.whistle_detector',
    'apps.morse_code',
    'apps.speech_transcriber',
    'apps.webcam_ruler',
    'apps.voice_stripper',
    'apps.web_soundboard',
    'apps.chat_highlights',
    'apps.eliza_parser',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

if DEBUG:
    INSTALLED_APPS.insert(1, 'debug_toolbar')
    MIDDLEWARE = [
        m for m in MIDDLEWARE if m != 'whitenoise.middleware.WhiteNoiseMiddleware'
    ]
    MIDDLEWARE.insert(2, 'debug_toolbar.middleware.DebugToolbarMiddleware')

ROOT_URLCONF = 'portfolio.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db_data' / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'apps', 'new_main', 'static'),
    os.path.join(BASE_DIR, 'apps', 'magic_eye', 'static'),
    os.path.join(BASE_DIR, 'apps', 'whistle_detector', 'static'),
    os.path.join(BASE_DIR, 'apps', 'morse_code', 'static'),
    os.path.join(BASE_DIR, 'apps', 'webcam_ruler', 'static'),
    os.path.join(BASE_DIR, 'apps', 'web_soundboard', 'static'),
    os.path.join(BASE_DIR, 'apps', 'eliza_parser', 'static'),
)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

INTERNAL_IPS = ['127.0.0.1']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        },
    },
}
