from django.db import models
from django.urls import reverse

from base.models import TimeMixin
from accounts.models import User
from articles.models import Article

# Create your models here.

class Comment(TimeMixin):
    username = models.CharField('게시자', max_length=20, null=True, blank=True)
    password = models.CharField('비밀번호', max_length=128, null=True, blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, related_name='childs', null=True, blank=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_comment', null=True, blank=True)
    article = models.ForeignKey(
        Article, on_delete=models.CASCADE, related_name="article_comment")
    context = models.TextField('내용')

    @property
    def get_absolute_url(self):
        return reverse('blog:view', kwargs={'blog_id': self.article.blog_id, 'article_id': self.article_id})
