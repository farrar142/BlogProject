import datetime
from django.utils import timezone
from django.db import models
from django.db.models import QuerySet
from django.apps import apps
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import check_password, make_password
from jose import jwt
from base.serializer import to_dict

from base.settings import SECRET_KEY
# Create your models here.


def get_default_nickname(instance):
    return instance.username


class User(AbstractUser):
    """
    패스워드는 상속
    """
    class Meta:
        db_table = "accounts_user"
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(
        '유저이름',
        max_length=20,
        help_text='20자 이하로 작성해주세요 @/./+/-/_ 를 사용 할 수 있습니다..',
        unique=True
    )
    nickname = models.CharField(
        '닉네임',
        max_length=20,
        help_text='20자 이하로 작성해주세요 @/./+/-/_ 를 사용 할 수 있습니다..',
        default="nickname"
    )
    email = models.EmailField('이메일')
    profile_url = models.CharField(max_length=256, null=True, blank=True)

    @classmethod
    def create(cls, username: str, email: str, password: str):
        user: User = User.objects.create(
            username=username, email=email, password=make_password(password), nickname=username)
        return user

    def check_password(self, password: str):
        return check_password(password, self.password)

    def change_nickname(self, nickname: str):
        self.nickname = nickname
        self.save()
        self.refresh_from_db()
        return self

    def get_user_info(self):
        blogs = self.blog.all()
        blog_id = 0
        blog_name = ""
        if blogs.exists():
            blog = blogs.first()
            blog_id = blog.id
            blog_name = blog.name
        resp = to_dict(self)
        resp["blog_id"] = blog_id
        resp["blog_name"]=blog_name
        return resp


    @classmethod
    def offer_token(cls, pk):
        payload = {
            "id": pk,
            "exp": datetime.datetime.now()+datetime.timedelta(days=2, hours=-9),
            'iat': datetime.datetime.now()+datetime.timedelta(hours=-9),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token

    def make_token(self):
        payload = {
            "id": self.pk,
            "exp": datetime.datetime.now()+datetime.timedelta(days=2, hours=-9),
            'iat': datetime.datetime.now()+datetime.timedelta(hours=-9),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token
