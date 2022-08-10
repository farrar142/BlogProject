from typing import List
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from ninja import ModelSchema, NinjaAPI, Schema
import datetime
from django.contrib.auth import authenticate
from jose import jwt
from accounts.models import User
from base.serializer import to_dict
from base.auth import AuthBearer
from base.settings import SECRET_KEY
from django.contrib.auth.hashers import check_password, make_password
auth = NinjaAPI(urls_namespace="auth",csrf=False,version="1.01")


class UserLoginSchema(Schema):
    password: str
    username:str


class TokenForm(Schema):
    token: str


class UserOut(Schema):
    user_id: int
    username: str
    email: str
    profile_url: str = None


class SimpleForm(Schema):
    test:str
    
@auth.post('/test/signin',auth=AuthBearer())
def index(request):
    return {"data":"success"}

@auth.post('signin')
def signin(request, form: UserLoginSchema):
    user = authenticate(request, **form.dict())
    if user:
        return {"token":User.offer_token(user.pk)}
    return HttpResponseForbidden()


class SimpleResponse(Schema):
    status: int
    message: str
    data: List[UserOut]


class UserSignUpForm(Schema):
    username: str
    email: str
    password: str


@auth.post('signup')
def signup(request, form: UserSignUpForm):
    is_username = User.objects.filter(username=form.username)
    is_email = User.objects.filter(email=form.email)
    if is_username.exists():
        return {
            "status": 1,
            "message": f"{form.username}이 이미 존재합니다",
            "data": []
        }
    elif is_email.exists():
        return {
            "status": 1,
            "message": f"{form.email}이 이미 존재합니다",
            "data": []
        }
    else:
        user = User.objects.create(
            username=form.username, email=form.email, password=make_password(form.password))
        return {
            "status": 0,
            "message": f"환영합니다 {form.username}님",
            "data": []
        }


@auth.post('user', auth=AuthBearer())
def get_user_info(request):
    return request.auth
