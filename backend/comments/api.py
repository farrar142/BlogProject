from typing import List
from ninja import NinjaAPI, Schema
from ninja.renderers import BaseRenderer
from django.db.models import QuerySet
from django.db.models import F
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest,HttpResponseForbidden
from comments.models import *
from base.api_base import MyRenderer
from base.serializer import to_dict

from base.api_base import pagination,qs_to_list
from base.serializer import converter, serialize
from base.const import *
from base.utils import useCache
from base.auth import AuthBearer

comments = NinjaAPI(urls_namespace="comments",csrf=False, renderer=MyRenderer(), version="1.00")

class CommentForm(Schema):
    username: str = None
    password: str = None
    parent_id: int = None
    user_id: int = None
    article_id: int
    context: str
    
@comments.get('')
def get_comments(request, article_id: int):
    comments = comment_formatter({"article_id": article_id})
    return comments


@comments.post('')
def postComment(request, form: CommentForm):
    if (form.username and form.password) or form.user_id:
        comment = Comment.objects.create(**form.dict())
        return comment_formatter({"id": comment.id})
    else:
        return []




@comments.delete('{comment_id}/')
def del_comments(request, comment_id: int):
    comment = Comment.objects.filter(id=comment_id)
    comment.delete()
    return True

def comment_formatter(condition):
    return Comment.objects.prefetch_related('user').filter(**condition).annotate(username_with_id=F("user__username"), profile_url=F("user__profile_url")).values()