from rest_framework import serializers
from .models import Todo

# Todo Serializer
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = '__all__'