import datetime
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
from jose import jwt

from base.settings import SECRET_KEY
# Create your models here.

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
    email = models.EmailField('이메일')
    profile_url = models.CharField(max_length=256,null=True,blank=True)
    
    @classmethod
    def offer_token(cls,pk):
        payload = {
            "id": pk,
            "exp": datetime.datetime.now()+datetime.timedelta(days=2,hours=-9),
            'iat': datetime.datetime.now()+datetime.timedelta(hours=-9),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token
    
    def make_token(self):
        payload = {
            "id": self.pk,
            "exp": datetime.datetime.now()+datetime.timedelta(days=2,hours=-9),
            'iat': datetime.datetime.now()+datetime.timedelta(hours=-9),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return token
        
