import json
from datetime import datetime, timedelta
import math
import re
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
from base.api_base import qs_to_list
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
from functools import wraps



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
    res = request.auth.create_blog(form.blog_id, form.blog_name)
    if res:
        return res
    else:
        return HttpResponseForbidden()


@api.get('{blog_id}')
def get_blog_by_id(request, blog_id: int):
    return Blog.objects.filter(pk=blog_id)


# 블로그 end


@api.get('articles/random')
def get_random_articles(request, tag: str = ""):
    target = target = Article.objects.all()
    if tag:
        target = target.filter(tags__name__icontains=tag)
    return articles_formatter(target, page=1, order_by="?")


@api.get('articles/all/id')
def get_all_articles_id(request):
    return Article.objects.filter(deleted_at__isnull=True, status=0).values('id', "blog_id")


def get_int_num_from_kwargs(kwargs: dict, key: str, default_num=0):
    page = kwargs.get(key)
    if isinstance(page, str):
        return int(page)
    elif isinstance(page, int):
        return page
    else:
        return default_num


def pagination(func=None, offset=1, limit=10):
    def decorator(cb):
        @wraps(cb)
        def wrapper(qs: QuerySet, *args, **kwargs):
            page = get_int_num_from_kwargs(kwargs, "page", default_num=offset)
            perPage = get_int_num_from_kwargs(
                kwargs, "perPage", default_num=limit)
            paginated_qs = qs[(page-1)*perPage:page*perPage]
            result: QuerySet = cb(paginated_qs, *args, **kwargs)
            qs_len = 0
            try:
                qs_len = qs.count()
            except:
                qs_len = len(qs)
            length = math.ceil(qs_len/perPage)
            return {
                "type": "paginated",
                "contentLength": qs_len,
                "currentLength": len(result),
                "maxPage": length,
                "curPage": page,
                "perPage": perPage,
                "hasNext": page < length,
                "results": converter(result),
            }
        return wrapper
    return decorator(func) if callable(func) else decorator


@api.get('articles/{blog_id}')
def get_articles(request, blog_id: int, page: int = 1, perPage: int = 10, tag: str = "", context: bool = False):

    blog = Blog.objects.filter(pk=blog_id)
    if not blog:
        return []
    blog = blog.first()
    articles = Article.objects.filter(
        blog=blog, deleted_at__isnull=True, status=NORMAL).exclude(
        tags__name="과제")
    # Count('comment', filter=Q(comment__deleted_at__isnull=True)))
    articles = articles.order_by("-reg_date")
    if tag:
        articles = get_hashtag_articles(articles, tag)
    return articles_formatter(articles, page=page, perPage=perPage, context=context)


@pagination
def articles_formatter(articles: QuerySet, page=1, perPage=10, order_by="-reg_date", context=False, images=False):
    try:
        articles = articles.select_related(
            'blog').prefetch_related('comment', 'tags', 'images')
    except:
        pass
    result_set = []
    for article in articles:
        comment_count = article.comment.all().count()
        dictmodel: dict = to_dict(article)
        dictmodel.update(comment_count=comment_count, hashtags=dictmodel.get('tags'),
                         blog_id=article.blog.pk)
        dictmodel.pop("tags")
        if images:
            dictmodel.update(images=qs_to_list(article.images.all()))
        if not context:
            dictmodel.pop("context")
        result_set.append(dictmodel)
    return result_set


@api.get('{blog_id}/tags')
def get_tags(request, blog_id: int):
    result = HashTag.objects.prefetch_related('articles').annotate(count=Count('articles'), blog_id=F('articles__blog_id'), status=F(
        'articles__status'))
    if blog_id >= 1:
        result = result.filter(blog_id=blog_id)
    result = result.exclude(status=DELETED).values(
        'name', 'count').exclude(name='과제').exclude(name='test').order_by('-count')
    return result


@api.get('article/{article_id}')
def get_article(request, article_id: int):
    article = Article.cached.filter(article_id)
    return articles_formatter(article, context=True, images=True)


@api.post('article/{article_id}/delete')
def delete_article(request, article_id: int):
    article = Article.objects.filter(pk=article_id).first()
    if article:
        article.delete()
        return HttpResponse("success")
    else:
        return HttpResponseBadRequest("failed")


class SizeForm(Schema):
    width: int = 1
    height: int = 1


class ImageForm(Schema):
    id: int
    dataURL: str
    size: SizeForm
    type: str


class ArticleForm(Schema):
    title: str
    tags: str
    context: str
    images: List[ImageForm] = None


@api.get('images')
def get_images(request):
    return Image.objects.all()


@api.post("article/{articleId}/edit")
def editArticle(request, articleId: int, form: ArticleForm, action: str = "write"):
    user = request.user
    blog = user.blog.all().first()
    print(form, action)
    if action == "write":
        article = Article(user=user, blog=blog,
                          title=form.title, context=form.context)
        article.save()
        for image in form.images:
            Image.objects.create(
                object_id=image.id,
                dataURL=image.dataURL,
                size=image.size.dict(),
                type=image.type,
                article=article
            )
        tags_setter(article, form.tags)
    elif action == "edit":
        article: Article = Article.objects.filter(pk=articleId).get()
        article.title = form.title
        article.context = form.context
        article.images.all().delete()
        for image in form.images:
            Image.objects.create(
                object_id=image.id,
                dataURL=image.dataURL,
                size=image.size.dict(),
                type=image.type,
                article=article
            )
        if article:
            tags_setter(article, form.tags)
        pass
    else:
        article = None
    return Article.cached.filter(article.pk)


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


def tags_setter(article: Article, rawtags: str):
    article.tags.clear()
    tags = tag_joiner(rawtags)
    if tags:
        for i in tags:
            article.tags.add(HashTag.objects.get_or_create(name=i)[0])
    article.save()


def tag_joiner(words: str):
    return ''.join(words.split()).split('#')[1:]


def get_hashtag_articles(articles: QuerySet, name):
    return articles.filter(tags__name=name)


class CommentForm(Schema):
    username: str = None
    password: str = None
    parent_id: int = None
    user_id: int = None
    article_id: int
    context: str


def comment_formatter(condition):
    return Comment.objects.prefetch_related('user').filter(**condition).annotate(username_with_id=F("user__username"), profile_url=F("user__profile_url")).values()


@api.post('comment/')
def postComment(request, form: CommentForm):
    try:
        del form.token
    except:
        pass
    if (form.username and form.password) or form.user_id:
        comment = Comment.objects.create(**form.dict())
        return comment_formatter({"id": comment.id})
    else:
        return []


@api.get('article/{article_id}/comments')
def get_comments(request, article_id: int):
    comments = comment_formatter({"article_id": article_id})
    return comments


@api.delete('comment/{comment_id}/')
def del_comments(request, comment_id: int):
    comment = Comment.objects.filter(id=comment_id)
    comment.delete()
    return True
