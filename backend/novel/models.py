from django.db import models

from base.models import TimeMixin

# Create your models here.

class Series(TimeMixin):
    title = models.CharField("제목",max_length=50)
    
class Book(TimeMixin):
    title = models.CharField("제목",max_length=50)
    series = models.ForeignKey(Series,on_delete=models.CASCADE,related_name="books")
    content = models.TextField("내용")
    