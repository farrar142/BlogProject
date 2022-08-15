import datetime
from typing import List
from base.settings import SECRET_KEY
from base.test import TestCase
from django.http import HttpResponseForbidden
from django.db.models import QuerySet
from django.contrib.auth.models import AnonymousUser
from jose import jwt
from .models import User
# Create your tests here.


class TestSignin(TestCase):

    def test_회원가입_실패_어트리뷰트_부족(self):
        resp = self.client.post('/auth/signup', data={
            "username": "sandring",
            "password": "test1234",
        })
        self.assertEqual(resp.status_code, 422)

    def test_회원가입_성공(self):
        resp = self.client.post('/auth/signup', data={
            "username": "sandring",
            "password": "test1234",
            "email": "test@example.com"
        })
        self.assertEqual(resp.status_code, 200)

    def test_회원가입시_유저이름과_닉네임을_같게_생성(self):
        resp = self.client.post('/auth/signup', data={
            "username": "sandring",
            "password": "test1234",
            "email": "test@example.com"
        })
        users: QuerySet[User] = User.objects.all()
        for user in users:
            self.assertEqual(user.nickname, user.username)
            self.assertNotEqual(user.nickname, user.email)
        self.assertEqual(resp.status_code, 200)

    def test_중복된_아이디로는_가입_불가(self):
        resp = self.client.post('/auth/signup', data={
            "username": "sandring",
            "password": "test1234",
            "email": "test@example.com"
        })
        resp2 = self.client.post('/auth/signup', data={
            "username": "sandring",
            "password": "test1234",
            "email": "mandu_sarang@example.com"
        })
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json().get("status"), 1)
        self.assertEqual(resp2.json().get("data"), [])
        self.assertEqual(resp2.json().get("message"), "sandring이 이미 존재합니다")

    def test_중복된_이메일로도_가입_불가(self):
        resp = self.client.post('/auth/signup', data={
            "username": "sandring",
            "password": "test1234",
            "email": "test@example.com"
        })
        resp2 = self.client.post('/auth/signup', data={
            "username": "mandu_sarang",
            "password": "test1234",
            "email": "test@example.com"
        })
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json().get("status"), 1)
        self.assertEqual(resp2.json().get("data"), [])
        self.assertEqual(resp2.json().get("message"),
                         "test@example.com이 이미 존재합니다")

    def test_로그인_정보_부족시_422(self):
        self.signup()
        resp = self.client.post('/auth/signin', {
            "username": self.username
        })
        self.assertEqual(resp.status_code, 422)

    def test_로그인_정보가_있으나_실패시_403(self):
        self.signup()
        resp = self.client.post('/auth/signin', {
            "username": self.username,
            "password": "nonAvailablePassword"
        })
        self.assertEqual(resp.status_code, 403)

    def test_로그인시_token_객체를_반환(self):
        self.signup()
        resp = self.signin()
        token = resp.json().get('token')
        parsed_token = jwt.decode(token, SECRET_KEY, algorithms="HS256")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(type(token), str)

    def test_로그인_후_정보_업데이트_실패(self):
        self.signup()
        self.signin()
        users: QuerySet[User] = User.objects.all()
        self.assertEqual(len(users), 1)
        user: User = users.get() or AnonymousUser()
        self.assertEqual(isinstance(user, User), True)
        self.assertEqual(isinstance(user, AnonymousUser), False)
        self.client.authorize(user)  # 이후 위의 과정은 self.auto_login()으로 진행
        # 잘못된 요청
        resp1 = self.client.patch('/auth/update', data={"asset": 432})
        self.assertEqual(resp1.status_code, 422)
        # 업데이트 실패
        resp2 = self.client.patch(
            '/auth/update', data={"key": "asset", "value": 432})
        resp2_res = resp2.json()
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2_res.get("result"), False)

    def test_로그인_후_정보_업데이트_성공(self):
        user = self.auto_login()
        # 닉네임 업데이트 성공
        resp2 = self.client.patch(
            '/auth/update', data={"key": "nickname", "value": "success_case"})
        self.assertEqual(resp2.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.nickname, "success_case")
        # 비밀번호 업데이트 성공
        resp2 = self.client.patch(
            '/auth/update', data={"key": "password", "value": "success_password"})
        self.assertEqual(resp2.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.check_password('success_password'), True)


class TestToken(TestCase):
    def test_인증된_사용자(self):
        self.auto_login()
        resp = self.client.post("/auth/expired_test")
        self.assertEqual(resp.status_code, 200)

    def test_만료된_사용자(self):
        self.expired_login()
        resp = self.client.post("/auth/expired_test")
        self.assertEqual(resp.status_code, 403)

    def test_미인증_사용자(self):
        resp = self.client.post("/auth/expired_test")
        self.assertEqual(resp.status_code, 401)

    def test_잘못된_토큰_사용자(self):
        self.client.not_validated_token()
        resp = self.client.post("/auth/expired_test")
        self.assertEqual(resp.status_code, 403)
