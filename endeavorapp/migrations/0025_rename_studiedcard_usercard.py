# Generated by Django 4.0.5 on 2022-08-21 13:59

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('endeavorapp', '0024_alter_deck_name'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='StudiedCard',
            new_name='UserCard',
        ),
    ]