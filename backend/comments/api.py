from typing import List
from ninja import NinjaAPI, Schema
from ninja.renderers import BaseRenderer
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet
from django.db.models import F
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from comments.models import *
from base.api_base import MyRenderer
from base.serializer import to_dict

from base.api_base import pagination, qs_to_list
from base.serializer import converter, serialize
from base.const import *
from base.utils import useCache
from base.auth import AuthBearer
comment = NinjaAPI(urls_namespace="comment", csrf=False,
                   renderer=MyRenderer(), version="1.00")
comments = NinjaAPI(urls_namespace="comments", csrf=False,
                    renderer=MyRenderer(), version="1.00")


class CommentForm(Schema):
    username: str = None
    password: str = None
    parent_id: int = None
    user_id: int = None
    article_id: int
    context: str


@comment.get('')
def get_comments(request, article_id: int):
    comments = comment_formatter({"article_id": article_id})
    return comments


@comment.post('', auth=AuthBearer())
def postComment(request, form: CommentForm):
    if isinstance(request.auth, User):
        comment = Comment.create_authorize(
            article_id=form.article_id, user_id=form.user_id, context=form.context)
    else:
        comment = Comment.create_unauthorize(
            article_id=form.article_id, username=form.username, password=form.password, context=form.context)
    return comment_formatter({"id": comment.pk})


class CommentDelArgs(Schema):
    comment_id: int
    type: str
    password: str = None


@comment.delete('{comment_id}/', auth=AuthBearer())
def del_comments(request, comment_id: int, form: CommentDelArgs):

    if isinstance(request.auth, User):
        comment = Comment.objects.filter(user_id=request.auth, id=comment_id)
        if not comment.exists():
            return {"result": False, "message": "댓글이 존재하지 않습니다"}
        comment.delete()
        return {"result": True, "message": "삭제에 성공했습니다 인증된 유저"}
    else:
        comment = Comment.objects.filter(
            id=comment_id, password=form.password)
        if not comment.exists():
            return {"result": False, "message": "비밀번호가 일치하지 않습니다."}
        comment.delete()
        comment.delete()
        return {"result": True, "message": "삭제에 성공했습니다 미인증 유저"}


def comment_formatter(condition):
    return Comment.objects.prefetch_related('user').filter(**condition).annotate(username_with_id=F("user__username"), profile_url=F("user__profile_url")).values()
