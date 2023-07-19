# Generated by Django 4.2.3 on 2023-07-19 01:31

from django.db import migrations, models
import main.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.CharField(default=main.models.generate_id, max_length=6, primary_key=True, serialize=False, unique=True)),
                ('title', models.CharField(max_length=200, unique=True)),
                ('slug', models.SlugField(max_length=200, unique=True)),
                ('updated_on', models.DateTimeField(auto_now=True)),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('raw_content', models.TextField()),
                ('content', models.TextField()),
                ('content_type', models.IntegerField(choices=[(0, 'blog'), (1, 'project')])),
                ('status', models.IntegerField(choices=[(0, 'blog'), (1, 'project')])),
            ],
            options={
                'ordering': ['-created_on'],
            },
        ),
    ]
