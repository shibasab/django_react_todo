from django.db import models
from django.contrib.auth.models import User


class Todo(models.Model):
    todo_task = models.CharField(max_length=100)
    detail = models.TextField(max_length=500, blank=True)
    owner = models.ForeignKey(
        User, related_name="todo", on_delete=models.CASCADE, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
