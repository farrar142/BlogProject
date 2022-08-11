from ninja import NinjaAPI, Schema
from ninja.renderers import BaseRenderer
from base.api_base import MyRenderer
from base.serializer import to_dict

from base.serializer import converter, serialize
from base.const import *
from base.utils import useCache
from base.auth import AuthBearer

api = NinjaAPI(urls_namespace="articles",csrf=False, renderer=MyRenderer(), version="1.00")