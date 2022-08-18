# Generated by Django 4.0.7 on 2022-08-14 21:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('blog', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted_at', models.DateTimeField(default=None, null=True, verbose_name='삭제일')),
                ('reg_date', models.DateTimeField(auto_now_add=True, verbose_name='등록날짜')),
                ('update_date', models.DateTimeField(auto_now=True, null=True, verbose_name='수정날짜')),
                ('title', models.CharField(max_length=50, verbose_name='제목')),
                ('context', models.TextField(verbose_name='내용')),
                ('status', models.SmallIntegerField(blank=True, default=0, null=True, verbose_name='상태')),
                ('blog', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='articles', to='blog.blog')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='HashTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20, verbose_name='해시태그')),
            ],
        ),
        migrations.CreateModel(
            name='SaveHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('saved_date', models.DateTimeField(auto_now=True)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='savehistories', to='articles.article')),
            ],
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('object_id', models.IntegerField(verbose_name='버켓오브젝트ID')),
                ('dataURL', models.TextField(verbose_name='경로')),
                ('size', models.JSONField(verbose_name='가로세로길이')),
                ('type', models.CharField(max_length=20, verbose_name='파일타입')),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='articles.article')),
            ],
        ),
        migrations.AddField(
            model_name='article',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='articles', to='articles.hashtag'),
        ),
        migrations.AddField(
            model_name='article',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='articles', to=settings.AUTH_USER_MODEL),
        ),
    ]
