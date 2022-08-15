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

    def expired(self, user: User):
        token = User.expired_token(user.pk)
        self.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def not_validated_token(self):
        self.credentials(HTTP_AUTHORIZATION=f"Bearer nonvalidatedtoken")

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
    blog_name = "test_blog"

    def auto_login(self):
        self.signup()
        self.signin()
        users: QuerySet[User] = User.objects.all()
        user: User = users.get() or AnonymousUser()
        self.client.authorize(user)
        self.user = user
        return user

    def expired_login(self):
        self.signup()
        self.signin()
        users: QuerySet[User] = User.objects.all()
        user: User = users.get() or AnonymousUser()
        self.client.expired(user)
        self.user = user
        return user

    def make_blog(self):
        resp = self.client.post(
            "/api/blog/edit", {"blog_id": 0, "blog_name": self.blog_name})
        self.assertEqual(resp.status_code, 200)

    def make_article(self, title="test_article"):
        resp = self.client.post('/api/article/0/edit?action=write', {
            "title": title,
            "tags": "#test #tags",
            "context": "test_context_long",
            "images": [{
                "id": 0,
                "dataURL": "https://test.2.image.com/testimage.jpeg",
                "size": {
                    "width": 100,
                    "height": 100
                },
                "type": "jpeg"
            }]
        })
        self.assertEqual(resp.status_code, 200)
        return resp.json()

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

    def expired(self):
        return

    def setUp(self) -> None:
        super().setUp()
