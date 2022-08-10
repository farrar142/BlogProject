import datetime
from typing import List
from base.settings import SECRET_KEY
from base.test import TestCase
from django.http import HttpResponseForbidden
from django.db.models import QuerySet
from django.contrib.auth.models import AnonymousUser
from jose import jwt
from .models import User
# Create your tests here.


class Test_Article_CRUD(TestCase):

    def setUp(self):
        self.user = self.auto_login()

    def test_셋업_정상작동_테스트(self):
        self.assertEqual(self.user.username, self.username)

    def test_게시글_작성_실패(self):
        pass
