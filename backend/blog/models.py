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


class HashTag(models.Model):
    name = models.CharField('해시태그', max_length=20)


class Article(TimeMixin):
    objects = models.Manager()
    cached = CachedManager()
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='articles')
    blog = models.ForeignKey(
        Blog, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField('제목', max_length=50)
    context = models.TextField('내용')
    tags = models.ManyToManyField(HashTag, related_name="articles", blank=True)
    status = models.SmallIntegerField('상태', default=0, null=True, blank=True)

    @classmethod
    def get_articles(cls, **kwargs):
        result = cls.objects.filter()
        return result

    def save(self, *args, **kwargs):
        cached = useCache('article')
        super().save(*args, **kwargs)
        cached.set(self.pk, Article.objects.filter(id=self.pk))
        SaveHistory.objects.create(article=self)

    def __str__(self):
        return self.title

    @property
    def get_absolute_url(self):
        return reverse('blog:view', kwargs={'blog_id': self.blog_id, 'article_id': self.pk})


class Image(models.Model):
    object_id = models.IntegerField('버켓오브젝트ID')
    dataURL = models.TextField('경로')
    size = models.JSONField('가로세로길이')
    type = models.CharField('파일타입', max_length=20)
    article = models.ForeignKey(
        Article, related_name="images", on_delete=models.CASCADE)

    def delete(self, *args, **kwargs):
        result = requests.delete(
            url=f"https://media.honeycombpizza.link/mediaserver/file/{self.object_id}")
        return super().delete(*args, **kwargs)


class SaveHistory(models.Model):
    saved_date = models.DateTimeField(auto_now=True)
    article = models.ForeignKey(
        Article, on_delete=models.CASCADE, related_name='savehistories')


class Comment(TimeMixin):
    username = models.CharField('게시자', max_length=20, null=True, blank=True)
    password = models.CharField('비밀번호', max_length=128, null=True, blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, related_name='childs', null=True, blank=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comment', null=True, blank=True)
    article = models.ForeignKey(
        Article, on_delete=models.CASCADE, related_name="comment")
    context = models.TextField('내용')

    @property
    def get_absolute_url(self):
        return reverse('blog:view', kwargs={'blog_id': self.article.blog_id, 'article_id': self.article_id})


class Todo(TimeMixin):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='todo')
    context = models.CharField('할일', max_length=50)
