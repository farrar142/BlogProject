from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(Blog)
admin.site.register(Article)
admin.site.register(SaveHistory)
admin.site.register(Comment)