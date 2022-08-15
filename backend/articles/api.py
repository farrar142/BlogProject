from typing import List
from random import shuffle
from ninja import NinjaAPI, Schema, Field
from ninja.renderers import BaseRenderer
from django.db.models import QuerySet
from django.db.models import F
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.core.paginator import Paginator
from articles.models import *
from base.api_base import MyRenderer
from base.serializer import to_dict

from base.api_base import pagination, qs_to_list
from base.serializer import converter, serialize
from base.const import *
from base.utils import useCache
from base.auth import AuthBearer

articles = NinjaAPI(urls_namespace="articles", csrf=False,
                    renderer=MyRenderer(), version="1.00")


@articles.get('random')
def get_random_articles(request, tag: str = ""):
    target = target = Article.objects.all()
    if tag:
        target = target.filter(tags__name__icontains=tag)
    return articles_formatter(target, page=1, order_by="?")


@articles.get('')
def get_articles(request, blog_id: int, page: int = 1, perPage: int = 10, tag: str = "", title: str = "", last_id: int = 0, context: bool = False):

    blog = Blog.objects.filter(pk=blog_id)
    if not blog:
        return []
    blog = blog.first()
    filter = {"blog": blog}
    if title:
        filter.update(title__icontains=title)
    if last_id:
        filter.update(id__lt=last_id)
    articles = Article.objects.filter(
        **filter)
    if tag:
        articles = get_hashtag_articles(articles, tag)
    return articles_formatter(articles, page=page, perPage=perPage, context=context)


class SizeForm(Schema):
    width: int = 1
    height: int = 1


class ImageForm(Schema):
    id: int
    dataURL: str
    size: SizeForm
    type: str


class ArticleForm(Schema):
    title: str = Field(..., min_length=1)
    tags: str
    context: str = Field(..., min_length=1)
    images: List[ImageForm] = None


article = NinjaAPI(urls_namespace="article", csrf=False,
                   renderer=MyRenderer(), version="1.00")


@article.post("{articleId}/edit", auth=AuthBearer())
def editArticle(request, articleId: int, form: ArticleForm, action: str = "write"):
    user = request.auth
    blogs: QuerySet[Blog] = user.blog.all()
    if not blogs.exists():
        return HttpResponseForbidden()
    blog: Blog = blogs[0]
    if action == "write":
        article = Article.create(user=user, blog=blog,
                                 title=form.title, context=form.context)
        for image in form.images:
            Image.objects.create(
                object_id=image.id,
                dataURL=image.dataURL,
                size=image.size.dict(),
                type=image.type,
                article=article
            )
        article.tags_setter(form.tags)
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
            article.tags_setter(form.tags)
        pass
    else:
        article = None
    return Article.objects.filter(article.pk)


@article.get('{article_id}')
def get_article(request, article_id: int):
    article = Article.cached.filter(article_id)
    return articles_formatter(article, context=True, images=True)


@article.delete('{article_id}')
def delete_article(request, article_id: int):
    article = Article.objects.filter(pk=article_id).first()
    if article:
        article.delete()
        return {"result": True, "message": "삭제에 성공했습니다."}
    else:
        return {"result": False, "message": "삭제에 실패했습니다."}


@pagination
def articles_formatter(articles: QuerySet[Article], page=1, perPage=10, order_by="-reg_date", context=False, images=False):
    articles = articles.select_related(
        'blog').prefetch_related('article_comment', 'tags', 'images').order_by(order_by)
    result_set = []
    for article in articles:
        formatted = article.get_article_info(images=images, context=context)
        result_set.append(formatted)
    return result_set


def get_hashtag_articles(articles: QuerySet, name):
    return articles.filter(tags__name=name)
