python3 manage.py makemigrations
python3 manage.py migrate
uwsgi --env DJANGO_SETTINGS_MODULE=runthe_backend.settings --ini uwsgi.ini