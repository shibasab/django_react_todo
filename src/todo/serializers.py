from rest_framework import serializers
from .models import Todo

# Todo Serializer
# シリアル化をする(データをxml形式に変換)
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = "__all__"
