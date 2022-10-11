# Generated by Django 4.0.8 on 2022-10-11 23:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0002_article_hashtag_image_savehistory_remove_todo_user_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='article',
            name='hits',
        ),
        migrations.CreateModel(
            name='Hit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('count', models.IntegerField(default=0)),
                ('article', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='get_hits', to='articles.article')),
            ],
        ),
    ]
