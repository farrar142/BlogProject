FROM python:3.10-alpine

LABEL Farrar142 "gksdjf1690@gmail.com"

ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev libc-dev libffi-dev \
    && apk add --no-cache mariadb-dev\
    && apk add jpeg-dev zlib-dev libjpeg
COPY . .

RUN pip3 install -r requirements.txt

RUN apk del build-deps

ENTRYPOINT python3 manage.py makemigrations && python3 manage.py migrate && python3 manage.py runserver 0.0.0.0:8000
EXPOSE 8000