from typing import Any, Literal, TypeVar
from django.db import models
from base.utils import useCache
from django.db.models.query import QuerySet, RawQuerySet
from django.db.models.base import Model

_T = TypeVar("_T", bound=Model, covariant=True)


class CachedManager(models.Manager):
    cache = useCache('article')

    def __init__(self, *args, **kwargs):
        model = kwargs.get("model")
        if model:
            self.cache = useCache(model)
            kwargs.pop("model")
        super().__init__(*args, **kwargs)

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True, status=0)

    def filter(self, id: int):
        data: QuerySet[Any] | Literal[False] = self.cache.get(id)
        if not data:
            data = self.get_queryset().filter(pk=id, deleted_at__isnull=True, status=0)
            self.set(id, data)
            print("noCachedData")
        else:
            print("returnCachedData")
        return data

    def set(self, id: int, qs: QuerySet[Any]):
        self.cache.set(id, qs)
