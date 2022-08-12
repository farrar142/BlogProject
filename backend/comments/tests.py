# Create your tests here.
import datetime
from re import A
from typing import List
from accounts.models import User
from base.settings import SECRET_KEY
from base.test import TestCase
from django.http import HttpResponseForbidden
from django.db.models import QuerySet
from django.contrib.auth.models import AnonymousUser
from jose import jwt
from articles.models import Article
# Create your tests here.


class Test_Comment_CRUD(TestCase):
    def test_코멘트_작성_실패(self):
        user = self.auto_login()
        self.make_blog()
        article_id = self.make_article()[0].get("id")
        self.assertEqual(isinstance(article_id, int), True)
        self.assertGreater(article_id, 1)
