import datetime
from typing import List
from accounts.models import User
from base.settings import SECRET_KEY
from base.test import TestCase
from django.http import HttpResponseForbidden
from django.db.models import QuerySet
from django.contrib.auth.models import AnonymousUser
from jose import jwt
from .models import Blog
# Create your tests here.


class Test_Blog_CRUD(TestCase):
    
    def test_로그인_안되어있을시_블로그_만들기_실패(self):
        resp = self.client.post(
            "/api/blog/edit", {"blog_id": 0, "blog_name": "test_blog"})
        self.assertEqual(resp.status_code, 401)  # unAuthroized

    def test_로그인_되어있을시_블로그_만들기_성공(self):
        user = self.auto_login()
        resp = self.client.post(
            "/api/blog/edit", {"blog_id": 0, "blog_name": "test_blog"})
        blog = resp.json()
        self.assertEqual(isinstance(blog, list), True)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(blog[0].get("name"), "test_blog")

    def test_블로그가_존재할_시_블로그이름_업데이트(self):
        user = self.auto_login()
        resp = self.client.post(
            "/api/blog/edit", {"blog_id": 0, "blog_name": "test_blog"})
        blog = resp.json()[0]
        blog_id = blog.get("id")
        resp = self.client.post(
            "/api/blog/edit", {"blog_id": blog_id, "blog_name": "changed_name"})
        changed_blog = Blog.objects.get(pk=blog_id)
        self.assertEqual(changed_blog.name, "changed_name")

    def test_타인의_블로그_이름_업데이트_불가(self):
        user = self.auto_login()
        resp1 = self.client.post(
            "/api/blog/edit", {"blog_id": 0, "blog_name": "test_blog"})
        blog = resp1.json()[0]
        blog_id = blog.get("id")
        other_user = User.create(
            username="other_user", email="other@example.com", password="other_password")
        other_blog = Blog.create_blog(other_user,0, "other_blog")
        if other_blog:
            resp2 = self.client.post(
                "/api/blog/edit", {"blog_id": other_blog.pk, "blog_name": "change_blog_name"})
            self.assertEqual(resp2.status_code, 403)
        else:
            self.assertEqual(False,True)

    def test_자신의_블로그는_업데이트_가능(self):
        user = self.auto_login()
        resp1 = self.client.post(
            "/api/blog/edit", {"blog_id": 0, "blog_name": "test_blog"})
        blog = resp1.json()[0]
        blog_id = blog.get("id")
        other_user = User.create(
            username="other_user", email="other@example.com", password="other_password")
        blog_maded = Blog.create_blog(other_user,0, "other_blog")
        if blog_maded:
            other_blog: Blog = blog_maded
            self.client.authorize(other_user)
            resp2 = self.client.post(
                "/api/blog/edit", {"blog_id": other_blog.pk, "blog_name": "change_blog_name"})
            self.assertEqual(resp2.status_code, 200)
            other_blog.refresh_from_db()
            self.assertEqual(other_blog.name, "change_blog_name")
        else:
            self.assertEqual(True, False)


