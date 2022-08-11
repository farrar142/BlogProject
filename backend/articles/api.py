from typing import List
from ninja import NinjaAPI, Schema,Field
from ninja.renderers import BaseRenderer
from django.db.models import QuerySet
from django.db.models import F
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest,HttpResponseForbidden
from articles.models import *
from base.api_base import MyRenderer
from base.serializer import to_dict

from base.api_base import pagination,qs_to_list
from base.serializer import converter, serialize
from base.const import *
from base.utils import useCache
from base.auth import AuthBearer

articles = NinjaAPI(urls_namespace="articles",csrf=False, renderer=MyRenderer(), version="1.00")

@articles.get('random')
def get_random_articles(request, tag: str = ""):
    target = target = Article.objects.all()
    if tag:
        target = target.filter(tags__name__icontains=tag)
    return articles_formatter(target, page=1, order_by="?")


@articles.get('all/id')
def get_all_articles_id(request):
    return Article.objects.filter(deleted_at__isnull=True, status=0).values('id', "blog_id")



@articles.get('{blog_id}')
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


class SizeForm(Schema):
    width: int = 1
    height: int = 1


class ImageForm(Schema):
    id: int
    dataURL: str
    size: SizeForm
    type: str


class ArticleForm(Schema):
    title: str = Field(...,min_length=1)
    tags: str
    context: str= Field(...,min_length=1)
    images: List[ImageForm] = None


article = NinjaAPI(urls_namespace="article",csrf=False, renderer=MyRenderer(), version="1.00")


@article.post("{articleId}/edit",auth=AuthBearer())
def editArticle(request, articleId: int, form: ArticleForm, action: str = "write"):
    user = request.auth
    blogs:QuerySet[Blog] = user.blog.all()
    if not blogs.exists():
        return HttpResponseForbidden()
    blog:Blog = blogs[0]
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
    return Article.cached.filter(article.pk)



@article.get('{article_id}')
def get_article(request, article_id: int):
    article = Article.cached.filter(article_id)
    return articles_formatter(article, context=True, images=True)


@article.post('{article_id}/delete')
def delete_article(request, article_id: int):
    article = Article.objects.filter(pk=article_id).first()
    if article:
        article.delete()
        return HttpResponse("success")
    else:
        return HttpResponseBadRequest("failed")





@pagination
def articles_formatter(articles: QuerySet, page=1, perPage=10, order_by="-reg_date", context=False, images=False):
    try:
        articles = articles.select_related(
            'blog').prefetch_related('comment', 'tags', 'images')
    except:
        pass
    result_set = []
    for article in articles:
        comment_count = article.article_comment.all().count()
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


def get_hashtag_articles(articles: QuerySet, name):
    return articles.filter(tags__name=name)



