from typing import TypeVar
from django.db import models
from base.utils import useCache
from django.db.models.query import QuerySet, RawQuerySet
from django.db.models.base import Model

_T = TypeVar("_T", bound=Model, covariant=True)


class CachedManager(models.Manager):
    cache = useCache('article') 

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True, status=0)

    def filter(self, id):
        data = self.cache.get(id)
        if not data:
            data = self.get_queryset().filter(pk=id, deleted_at__isnull=True, status=0)
            self.cache.set(id, data)
            print("noCachedData")
        else:
            print("returnCachedData")
        return data
