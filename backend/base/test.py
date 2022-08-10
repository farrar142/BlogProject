import json

from django.contrib.auth import get_user_model
from django.test.client import AsyncClient, Client as _Client
from django.test import TestCase


from accounts.models import User


class Client(_Client):
    header = {}
    
    def credentials(self,**kwargs):
        self.header = {**kwargs}
        
    
    def login(self, user:User):
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
            path, data, content_type, follow, **extra,**self.header
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
            **extra,**self.header
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
            **extra,**self.header
        )


class TestCase(TestCase):
    client_class = Client

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
