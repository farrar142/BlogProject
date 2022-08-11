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


class Test_Article_CRUD(TestCase):
    def test_로그인_되어있지_않을_시_게시글_만들기_실패(self):
        resp = self.client.post('/api/article/0/edit?action=write',{
            "title":"test_title",
            "tags":"#test #tags",
            "context":"test_context_long",
            "image":[{
                "id":0,
                "dataURL":"https://test.2.image.com/testimage.jpeg",
                "size":{
                    "width":100,
                    "height":100
                },
                "type":"jpeg"
                }]
        })
        self.assertEqual(resp.status_code,401)
        
    def test_블로그를_생성하지_않았을_시_게시글_만들기_실패(self):
        self.auto_login()
        resp = self.client.post('/api/article/0/edit?action=write',{
            "title":"test_title",
            "tags":"#test #tags",
            "context":"test_context_long",
            "images":[{
                "id":0,
                "dataURL":"https://test.2.image.com/testimage.jpeg",
                "size":{
                    "width":100,
                    "height":100
                },
                "type":"jpeg"
                }]
        })
        self.assertEqual(resp.status_code,403)
        
        
    def test_벨리데이션_실패시_게시글_만들기_실패(self):
        self.auto_login()
        self.make_blog()
        resp = self.client.post('/api/article/0/edit?action=write',{
            "title":"",
            "tags":"#test #tags",
            "context":"test_context_long",
            "image":[{
                "id":0,
                "dataURL":"https://test.2.image.com/testimage.jpeg",
                "size":{
                    "width":100,
                    "height":100
                },
                "type":"jpeg"
                }]
        })
        self.assertEqual(resp.status_code,422)
        
    def test_벨리데이션_성공_시_게시글_만들기_성공(self):
        self.auto_login()
        self.make_blog()
        resp = self.client.post('/api/article/0/edit?action=write',{
            "title":"test_title",
            "tags":"#test #tags",
            "context":"test_context_long",
            "images":[{
                "id":0,
                "dataURL":"https://test.2.image.com/testimage.jpeg",
                "size":{
                    "width":100,
                    "height":100
                },
                "type":"jpeg"
            }]
        })
        self.assertEqual(resp.status_code,200)
        articles:QuerySet[Article] = Article.objects.all()
        if articles.exists():
            article = articles[0]
            self.assertEqual(article.title,"test_title")
            self.assertEqual(len(article.images.all()),1)
            self.assertEqual(len(article.tags.all()),2)
        else:
            self.assertEqual(True,False)
        