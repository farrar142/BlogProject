import json

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test.client import AsyncClient, Client as _Client
from django.db.models import QuerySet

from django.test import TestCase


from accounts.models import User


class Client(_Client):
    header = {}

    def credentials(self, **kwargs):
        self.header = {**kwargs}

    def authorize(self, user: User):
        token = user.make_token()
        self.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def logout(self):
        self.credentials()

    def post(
        self,
        path,
        data=None,
        content_type='application/json',
        follow=False,
        **extra,
    ):
        if content_type == 'application/json':
            data = json.dumps(data)
        return super(Client, self).post(
            path, data, content_type, follow, **extra, **self.header
        )

    def patch(
        self,
        path,
        data=None,
        content_type='application/json',
        follow=False,
        **extra,
    ):
        if content_type == 'application/json':
            data = json.dumps(data)
        return super(Client, self).patch(
            path,
            data,
            content_type,
            follow,
            **extra, **self.header
        )

    def delete(
        self,
        path,
        data=None,
        content_type='application/json',
        follow=False,
        **extra,
    ):
        if content_type == 'application/json':
            data = json.dumps(data)
        return super(Client, self).delete(
            path,
            data,
            content_type,
            follow,
            **extra, **self.header
        )


class TestCase(TestCase):
    client_class = Client
    user = AnonymousUser()
    username = "sandring"
    email = "test@example.conm"
    password = "test1234"

    def auto_login(self):
        self.signup()
        self.signin()
        users: QuerySet[User] = User.objects.all()
        user: User = users.get() or AnonymousUser()
        self.client.authorize(user)
        self.user = user
        return user

    def signup(self):
        self.client.post('/auth/signup', data={
            "username": self.username,
            "password": self.password,
            "email": self.email
        })

    def signin(self):
        return self.client.post('/auth/signin', data={
            "username": self.username,
            "password": self.password,
        })

    def setUp(self) -> None:
        super().setUp()
        # User = get_user_model()
        # self.user = User.objects.create(
        #     username='testuser',
        #     email='testuser@contoso.net',
        #     nickname='테스트 사용자',
        #     bio='Hello, World!',
        # )
        # self.user.set_password('test1234!@#$')
        # self.user.save()