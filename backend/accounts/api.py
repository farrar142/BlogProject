import datetime
import os
import requests
from typing import List
from tasks import send_accounts_find_email
from blog.models import Blog

from base.auth import AuthBearer
from base.serializer import to_dict
from base.settings import SECRET_KEY
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet
from django.http import *
from django.shortcuts import get_object_or_404
from jose import jwt
from ninja import ModelSchema, NinjaAPI, Schema
from dotenv import load_dotenv
from accounts.models import User

load_dotenv()

auth = NinjaAPI(urls_namespace="auth", csrf=False, version="1.01")


class UserLoginSchema(Schema):
    password: str
    username: str


class TokenForm(Schema):
    token: str


class UserOut(Schema):
    user_id: int
    blog_id: int
    username: str
    email: str
    profile_url: str = None


class SimpleForm(Schema):
    test: str


@auth.post('/test/signin', auth=AuthBearer())
def index(request):
    return {"data": "success"}


@auth.post('signin')
def signin(request, form: UserLoginSchema):
    user = authenticate(request, **form.dict())
    if user:
        return {"token": User.offer_token(user.pk)}
    return HttpResponseForbidden()


@auth.post('expired')
def expired(request, form: UserLoginSchema):
    user = authenticate(request, **form.dict())
    if user:
        return {"token": User.expired_token(user.pk)}
    return HttpResponseForbidden()


@auth.post("expired_test", auth=AuthBearer())
def expired_test(request):
    if isinstance(request.auth, AnonymousUser):
        return HttpResponseForbidden()
    else:
        return HttpResponse()


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
        user = User.create(**form.dict())
        return {
            "status": 0,
            "message": f"환영합니다 {form.username}님",
            "data": []
        }


class Change_User(Schema):
    key: str
    value: str


@auth.patch('update', auth=AuthBearer())
def update_user(request, form: Change_User):
    auth: User = request.auth
    user = User.objects.filter(pk=auth.pk)
    if not isinstance(user.get(), AnonymousUser):
        try:
            value = form.value if form.key != "password" else make_password(
                form.value)
            update = {form.key: value}
            user.update(**update)
            return {"result": True, "message": "비밀번호 변경에 성공했습니다."}
        except:
            return {"result": False, "message": "비밀번호 변경에 실패했습니다."}
    else:
        return {"result": False, "message": "인증되지 않은 유저입니다"}


@auth.post('userinfo', auth=AuthBearer(), response=UserOut)
def get_user_info(request):
    return request.auth.get_user_info()


class EmailForm(Schema):
    email: str


@auth.post("idfind")
def id_find(request, form: EmailForm):
    users = User.objects.filter(email=form.email)
    if (users.exists()):
        send_accounts_find_email.delay(form.email)
        return {"result": True, "message": "이메일을 성공적으로 발신했습니다."}
    else:
        return {"result": False, "message": "이메일과 맞는 유저를 찾지 못했습니다."}


@auth.get("kakao/login")
def Kakao_login(request: HttpRequest):
    REST_API_KEY = os.environ.get("KAKAO__REST_API_KEY")
    REDIRECT_URI = os.environ.get("KAKAO__LOGIN_REDIRECT_URI")
    next_url = request.GET.get('next')
    kakao_auth_api = "https://kauth.kakao.com/oauth/authorize?"
    return {"url":
            f"{kakao_auth_api}client_id={REST_API_KEY}&redirect_uri={REDIRECT_URI}&response_type=code"
            }


class KakaoCallback(Schema):
    code: str


@auth.post("kakao/callback")
def Kakao_login_callback(request, form: KakaoCallback):
    code = form.code
    print(code)
    REST_API_KEY = os.environ.get("KAKAO__REST_API_KEY")
    REDIRECT_URI = os.environ.get("WAITING_HOW__LOGIN_REDIRECT_URI")
    token_request = requests.get(
        f"https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id={REST_API_KEY}&code={code}"
    )
    "&redirect_uri={REDIRECT_URI}"
    print(token_request)
    token_json = token_request.json()
    print(token_json)
    error = token_json.get("error", None)
    print(error)
    if error is not None:
        raise Exception('카카오 로그인 에러')

    access_token = token_json.get("access_token")

    profile_request = requests.get(
        "https://kapi.kakao.com/v2/user/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    profile_json = profile_request.json()

    id = profile_json.get("id")

    User.login_with_kakao(request, id)
    user: User = User.objects.get(provider_accounts_id=id)
    return {"token": user.make_token()}
