import datetime
from base.settings import SECRET_KEY
from base.test import TestCase
from django.http import HttpResponseForbidden
from jose import jwt
# Create your tests here.
class TestSignin(TestCase):
    username = "sandring"
    email = "test@example.conm"
    password = "test1234"
    def signup(self):
        self.client.post('/auth/signup',data={
            "username":self.username,
            "password":self.password,
            "email":self.email
        })
    def signin(self):
        return self.client.post('/auth/signin',data={
            "username":self.username,
            "password":self.password,
        })
    
    def test_회원가입_실패_어트리뷰트_부족(self):
        resp = self.client.post('/auth/signup',data={
            "username":"sandring",
            "password":"test1234",
        })
        self.assertEqual(resp.status_code,422)
        
    def test_회원가입_성공(self):
        resp = self.client.post('/auth/signup',data={
            "username":"sandring",
            "password":"test1234",
            "email":"test@example.com"
        })
        self.assertEqual(resp.status_code,200)
        
    def test_중복된_아이디로는_가입_불가(self):
        resp = self.client.post('/auth/signup',data={
            "username":"sandring",
            "password":"test1234",
            "email":"test@example.com"
        })
        resp2 = self.client.post('/auth/signup',data={
            "username":"sandring",
            "password":"test1234",
            "email":"mandu_sarang@example.com"
        })
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json().get("status"),1)
        self.assertEqual(resp2.json().get("data"),[])
        self.assertEqual(resp2.json().get("message"),"sandring이 이미 존재합니다")
        
    def test_중복된_이메일로도_가입_불가(self):
        resp = self.client.post('/auth/signup',data={
            "username":"sandring",
            "password":"test1234",
            "email":"test@example.com"
        })
        resp2 = self.client.post('/auth/signup',data={
            "username":"mandu_sarang",
            "password":"test1234",
            "email":"test@example.com"
        })
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json().get("status"),1)
        self.assertEqual(resp2.json().get("data"),[])
        self.assertEqual(resp2.json().get("message"),"test@example.com이 이미 존재합니다")
        
    def test_로그인_정보_부족시_422(self):
        self.signup()
        resp = self.client.post('/auth/signin',{
            "username":self.username
        })
        self.assertEqual(resp.status_code,422)
    
    def test_로그인_정보가_있으나_실패시_403(self):
        self.signup()
        resp = self.client.post('/auth/signin',{
            "username":self.username,
            "password":"nonAvailablePassword"
        })
        self.assertEqual(resp.status_code,403)
        
        
    def test_로그인시_token_객체를_반환(self):
        self.signup()
        resp = self.signin()
        token = resp.json().get('token')
        parsed_token = jwt.decode(token,SECRET_KEY, algorithms="HS256")
        print(parsed_token)
        iam = datetime.datetime.fromtimestamp(parsed_token.get('iat'))
        exp = datetime.datetime.fromtimestamp(parsed_token.get('exp'))
        print(datetime.datetime.now())
        print(iam)
        print(exp)
        self.assertEqual(resp.status_code,200)
        self.assertEqual(type(token),str)
        