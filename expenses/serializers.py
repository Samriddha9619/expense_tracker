from rest_framework import serializers
from .models import Category,Account,Transaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields = ['id', 'name', 'description', 'transaction_count', 'total_spent', 'created_at', 'updated_at']
        read_only_fields=['creted_at','updated_at']



