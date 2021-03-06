# Generated by Django 2.2.4 on 2019-08-21 13:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0003_auto_20190820_2051'),
    ]

    operations = [
        migrations.RenameField(
            model_name='todo',
            old_name='name',
            new_name='todo_task',
        ),
        migrations.RemoveField(
            model_name='todo',
            name='email',
        ),
        migrations.RemoveField(
            model_name='todo',
            name='message',
        ),
        migrations.AddField(
            model_name='todo',
            name='detail',
            field=models.TextField(blank=True, max_length=500),
        ),
    ]
