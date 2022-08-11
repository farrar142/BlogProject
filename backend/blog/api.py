import json
from datetime import datetime, timedelta
from typing import List
from django.db.models import *
from django.forms import model_to_dict
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, JsonResponse
from django.shortcuts import render
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AnonymousUser

from ninja import NinjaAPI, Schema
from base.api_base import MyRenderer
from base.serializer import to_dict

from base.serializer import converter, serialize
from base.const import *
from base.utils import useCache
from base.auth import AuthBearer

from articles.models import *

from custommiddle.models import Token
from blog.models import *

from tasks import send_accounts_find_email
from ninja.pagination import paginate



description = """
# 모의 주식 투자 시뮬레이터 API DOCS\n
### RESULT EX\n
    'json' : {\n
        'system':{\n
            'result' : 'SUCCEED' or 'FAILED'\n
        },\n
        'datas':[\n
            {'data1':'value1'},\n
            {'data2':'value2'},\n
        ],\n
    }\n
    
    CONST:
        SUCCEED = "SUCCEED"
        FAILED = "FAILED"
        NONE = "NONE"

        BUY = 1
        SELL = 2

        NORMAL = 1
        COMPLETE = 2
        CANCELED = 3
"""





api = NinjaAPI(urls_namespace="api", description=description,
               csrf=False, renderer=MyRenderer(), version="1.00")

class UserForm(Schema):
    username: str = ""
    password: str = ""


@api.get('cache')
def test_cache(request):
    target = useCache('article')
    data = []
    items = target.get_data()
    for i in items.keys():
        data.append(items[i])
    return data


@api.get('cache/{id}')
def get_single(request, id: int):
    target = useCache('article').get(id)
    return target


@api.delete('cache')
def delete_cache(request):
    target = useCache('article')
    return target.delete()

# 블로그 start


@api.get('/')
def get_blogs(request):
    blog = Blog.objects.all()
    return blog


@api.get('id')
def get_blogs_id(request):
    blog = Blog.objects.all().values('id')
    return blog


class BlogNameForm(Schema):
    blog_id: int
    blog_name: str


@api.post('edit', auth=AuthBearer())
def post_blog_name_change(request, form: BlogNameForm):
    if isinstance(request.auth, AnonymousUser):
        return HttpResponseForbidden()
    res = Blog.create_blog(request.auth,form.blog_id, form.blog_name)
    if res:
        return res
    else:
        return HttpResponseForbidden()


@api.get('{blog_id}')
def get_blog_by_id(request, blog_id: int):
    return Blog.objects.filter(pk=blog_id)


@api.get('{blog_id}/tags')
def get_tags(request, blog_id: int):
    result = HashTag.objects.prefetch_related('articles').annotate(count=Count('articles'), blog_id=F('articles__blog_id'), status=F(
        'articles__status'))
    if blog_id >= 1:
        result = result.filter(blog_id=blog_id)
    result = result.exclude(status=DELETED).values(
        'name', 'count').exclude(name='과제').exclude(name='test').order_by('-count')
    return result

# 블로그 end








@api.get("accounts/find/mail")
def mail_send(request, useremail: str):
    target = User.objects.filter(email=useremail)
    if target:
        result = send_accounts_find_email.delay(useremail)
        if result:
            return {"message": "성공"}
        else:
            return {"message": "실패"}
    else:
        return {"message": "유저가 존재하지 않습니다"}




