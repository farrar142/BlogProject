from django.db import models
from django.db.models import QuerySet
from django.urls import reverse
import requests
from accounts.models import User
from base.models import *
from base.utils import useCache
from blog.manager import CachedManager


class Blog(TimeMixin):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='blog')
    name = models.CharField('블로그이름', max_length=50)

    def update_blog_name(self, name):
        self.name = name
        self.save()
        
    @classmethod
    def create_blog(cls, user:User,blog_id, blog_name):
        is_other_blogs = cls.objects.filter(pk=blog_id)
        other_blog = is_other_blogs.first()
        if other_blog:
            if other_blog.user.pk != user.pk:
                return False
        blogs: QuerySet[cls] = cls.objects.filter(
            user=user, pk=blog_id)
        blog = blogs.first()
        if blog:
            blog.name = blog_name
            blog.save()
            return blog
        else:
            created = Blog.objects.create(user=user, name=blog_name)
            return created
# Create your models here.





class Todo(TimeMixin):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='todo')
    context = models.CharField('할일', max_length=50)
