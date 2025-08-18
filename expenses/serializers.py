from rest_framework import serializers
from .models import Category,Account,Transaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields = ['id', 'name', 'description', 'transaction_count', 'total_spent', 'created_at', 'updated_at']
        read_only_fields=['creted_at','updated_at']



class Account_serializers(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields={
            'id','name','account_type','account_type_display','balance',
            'description','is_active','transaction_count','created_at','updated_at'

        }

        read_only_fields=['balance','created_at','updated_at']

    def get_transaction_count(self,obj):
        return obj.transaction.count()
    
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Transaction
        fields={
            'user''account','category','transaction_type','amount''description','notes','date' }
        read_only_fields=['created_at','updated_at']

    def validate_amount(self,value):
        if value <=0:
            raise serializers.ValidationError("Ammount must be greater than zero")
        return value
    

    