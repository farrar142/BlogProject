# Generated by Django 4.0.7 on 2022-08-10 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_profile_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='nickname',
            field=models.CharField(default='nickname', help_text='20자 이하로 작성해주세요 @/./+/-/_ 를 사용 할 수 있습니다..', max_length=20, verbose_name='닉네임'),
        ),
    ]
