from datetime import datetime
from typing import TypedDict
from django.core.cache import cache
from django.http import *
from accounts.models import User
from base.settings import SECRET_KEY
from jose import jwt

class Token(TypedDict):
    id:int
    exp:datetime
    iat:datetime
class useCache:
    def __init__(self, model: str):
        self.model = model
        self.data = cache.get_or_set(self.model, {})

    def refresh(self):
        self.data = cache.get_or_set(self.model, {})

    def save(self):
        cache.set(self.model, self.data)

    def set(self, id, data):
        self.refresh()
        self.data[id] = data
        self.save()
        return data

    def get(self, id):
        self.refresh()
        data = self.data.get(id)
        if data:
            return data
        else:
            return False

    def get_or_set(self, id, data):
        data = self.get(id)
        if data:
            return data
        else:
            return self.set(id, data)

    def get_data(self):
        return self.data

    def delete(self):
        cache.delete(self.model)
        return cache.get(self.model)



def parse_token(str_token:str):
    token:Token= jwt.decode(str_token, SECRET_KEY, algorithms="HS256")
    return token

def get_user_from_token(parsed_token:Token):
    user:User= User.objects.filter(pk=parsed_token["id"]).get()
    return user

def import_token_from_request(request:HttpRequest):
    token =request.headers.get("Authorization")
    if token:
        token = token.split(" ")[1]
        return parse_token(token)
    else:
        raise Exception("invalid token")