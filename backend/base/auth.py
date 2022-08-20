from ninja.security import HttpBearer
from django.contrib.auth.models import AnonymousUser
from accounts.models import User
from .utils import get_user_from_token
from base.utils import parse_token
from base.settings import SECRET_KEY


class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            a = parse_token(token)
            user= get_user_from_token(a)
            return user
        except:
            return AnonymousUser()
