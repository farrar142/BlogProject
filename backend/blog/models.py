from django.db import models
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
# Create your models here.





class Todo(TimeMixin):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='todo')
    context = models.CharField('할일', max_length=50)
