from datetime import datetime
from decimal import Decimal
from asgiref.sync import sync_to_async
from django.db.models.base import ModelState, ModelBase
from django.db.models import QuerySet
from django.db import models
from pprint import pprint
from django.db.models import *


@sync_to_async
def aconverter(queries: QuerySet) -> dict:
    return converter(queries)


def converter(queries: QuerySet) -> []:
    """
    querydict타입과 model타입을 구분해서 serialize해줌
    """
    if isinstance(queries, dict):  # 일반 dict타입일경우
        return [serialize(queries)]

    target: list = type_checker(queries)
    try:
        for obj in target:
            obj: dict = serialize(obj)
    except:
        pass
    # pprint(target)#debug
    if target:
        return target
    else:
        return []
        return {'message': 'None Matched'}


def type_checker(queries):
    print(type(queries))
    if isinstance(queries, models.Model):  # Model속성일경우
        target = queries.__dict__
    elif isinstance(queries, QuerySet):
        if isinstance(queries.first(), models.Model):
            target = list(queries.values())
        else:
            print("value")
            target = list(queries)  # Queryset - Query속성일경우
    else:
        try:
            target = queries.__dict__
        except:
            target = queries
    if isinstance(target, list):
        return target
    else:
        return [target]


def serialize(obj: dict) -> dict:
    tmp = obj.copy()
    for k, v in tmp.items():
        if isinstance(obj[k], datetime):
            obj[k] = f'{obj[k]:%Y-%m-%d %H:%M:%S}'
        elif isinstance(obj[k], ModelBase):  # 추상타입일경우 삭제
            del(obj[k])
        elif isinstance(obj[k], ModelState):  # 추상타입일경우 삭제
            del(obj[k])
        elif isinstance(obj[k], Decimal):
            obj[k] = str(obj[k])
        elif k == '_state':
            del(obj[k])
    return obj


def to_dict(self, depth=1):
    opts = self._meta
    data = {}
    for f in opts.concrete_fields + opts.many_to_many:
        if f.name == "password":
            continue
        if isinstance(f, ManyToManyField):
            if self.pk is None:
                data[f.name] = []
            else:
                if depth >= 0:
                    _list = map(lambda x: to_dict(x, depth-1), f.value_from_object(
                        self))
                    data[f.name] = list(_list)
        elif isinstance(f, DateTimeField):
            val = f.value_from_object(self)
            if val:
                data[f.name] = f'{val:%Y-%m-%d %H:%M:%S}'
        elif isinstance(f, ImageField):
            val = f.value_from_object(self)
            if(val):
                data[f.name] = val.url
        else:
            data[f.name] = f.value_from_object(self)
    return data
