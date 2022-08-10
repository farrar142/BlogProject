from ninja.security import HttpBearer
from django.contrib.auth.models import AnonymousUser
from accounts.models import User
from jose import jwt
from base.settings import SECRET_KEY


class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            a = jwt.decode(token, SECRET_KEY, algorithms="HS256")
            user: User = User.objects.filter(pk=a["id"]).get()
            return user
        except:
            return AnonymousUser()
