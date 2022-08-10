"""
Django settings for base project.

Generated by 'django-admin startproject' using Django 3.2.11.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""
import os
import platform
import re

import django
from pathlib import Path
from base.secret import DATABASES, GOOGLE_ACCOUNT, GOOGLE_PASSWORD, REDIS_HOST
from django.utils.encoding import smart_str
django.utils.encoding.smart_text = smart_str
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-v_b^-&6fihj9)+672z&iwnr#9c$+h-^7a%h^u2$eot62njz9e0'
CSRF_TRUSTED_ORIGINS = ["https://blog.honeycombpizza.link"]
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    'novel',
    'tasks',
    'corsheaders',
    'custommiddle',
    'blog',
    'accounts',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    # 'custommiddle.middleware.JsonFormatter',
    'corsheaders.middleware.CorsMiddleware',
    'custommiddle.middleware.TimeChecker',
    'custommiddle.middleware.ResponseCheckMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'custommiddle.middleware.CustomTokenMiddleware',
]

ROOT_URLCONF = 'base.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['base/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'builtins': [
                'base.templatetags'
            ],
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'blog.processor.todolist',
                'blog.processor.commentlist',
            ],
            'libraries':{
                'tags': 'base.templatetags',
            },
        },
    },
]

WSGI_APPLICATION = 'base.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = DATABASES


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'ko-kr'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [
    BASE_DIR / 'base/static'
]
AUTH_USER_MODEL = 'accounts.User'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# token start
# CUSTOM_PREFIX = 'TOKEN_MID'
# TOKEN_MID_BACKEND_ONLY = True
# TOKEN_MID_STRATEGY = "WEAK"
# TOKEN_MID_FILTERED_METHODS = ['POST']
# TOKEN_MID_FILTERED_URLS = [
#     # re.compile(r'^(.*)/api'),
#     re.compile(r'^/api/signin'),
#     re.compile(r'^/api/signup'),
#     re.compile(r'^/api/comment'),
#     re.compile(r'^(.*)/admin/(.*)'),
# ]
# TOKEN_MID_TIMES = 24

CORS_ORIGIN_ALLOW_ALL = True
# CORS_ORIGIN_WHITELIST = ['http://127.0.0.1:3000', 'http://localhost:3000',
#                          'http://127.0.0.1:8888', 'http://localhost:8888', '*']
CORS_ALLOW_CREDENTIALS = True
# token end

# celery start


def ipchooser():
    if platform.system().strip() == "Windows":
        return '127.0.0.1'
    else:
        return '172.17.0.1'


redis_ip = ipchooser()


CELERY_BROKER_URL = REDIS_HOST
CELERY_RESULT_BACKEND = REDIS_HOST
CELERY_CACHE_BACKEND = REDIS_HOST
CELERY_TIMEZONE = 'Asia/Seoul'
CELERY_ENABLE_UTC = False
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60

# celery end

# mailserver start

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = GOOGLE_ACCOUNT
EMAIL_HOST_PASSWORD = GOOGLE_PASSWORD
# mailserver end

NINJA_PAGINATION_PER_PAGE = 10