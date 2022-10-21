python3 manage.py makemigrations
python3 manage.py migrate
uwsgi --env DJANGO_SETTINGS_MODULE=base.settings --ini uwsgi.ini