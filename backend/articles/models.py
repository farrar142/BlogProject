from django.db import models
from django.urls import reverse
import requests
from accounts.models import User
from blog.models import Blog
from base.models import *
from base.utils import useCache
from blog.manager import CachedManager
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
    def create(cls,user:User,blog:Blog,title:str,context:str):
        article = cls(user=user, blog=blog,
                          title=title, context=context)
        article.save()
        return article

    @classmethod
    def get_articles(cls, **kwargs):
        result = cls.objects.filter()
        return result

    def save(self, *args, **kwargs):
        cached = useCache('article')
        super().save(*args, **kwargs)
        cached.set(self.pk, Article.objects.filter(id=self.pk))
        SaveHistory.objects.create(article=self)

    def tags_setter(self, rawtags: str):
        self.tags.clear()
        tags = self.tag_joiner(rawtags)
        if tags:
            for i in tags:
                self.tags.add(HashTag.objects.get_or_create(name=i)[0])
        self.save()

    def tag_joiner(self,words: str):
        return ''.join(words.split()).split('#')[1:]
    def __str__(self):
        return self.title


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
