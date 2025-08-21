from rest_framework import serializers
from .models import Category, Account, Transaction

class CategorySerializer(serializers.ModelSerializer):
   transaction_count = serializers.SerializerMethodField()
   total_spent = serializers.SerializerMethodField()

   class Meta:
       model = Category
       fields = ['id', 'name', 'description', 'color', 'transaction_count', 'total_spent', 'created_at', 'updated_at']
       read_only_fields = ['created_at', 'updated_at']

   def get_transaction_count(self, obj):
       return obj.transactions.count()

   def get_total_spent(self, obj):
       from django.db.models import Sum
       total = obj.transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum']
       return float(total) if total else 0.0

   def validate_name(self, value):
       user = self.context['request'].user
       qs = Category.objects.filter(user=user, name=value)

       if self.instance:
           qs = qs.exclude(pk=self.instance.pk)

       if qs.exists():
           raise serializers.ValidationError("You already have a category with this name.")

       return value

class AccountSerializer(serializers.ModelSerializer):
   transaction_count = serializers.SerializerMethodField()
   account_type_display = serializers.CharField(source='get_account_type_display', read_only=True)

   class Meta:
       model = Account
       fields = [
           'id', 'name', 'account_type', 'account_type_display', 'balance',
           'description', 'is_active', 'transaction_count', 'created_at', 'updated_at'
       ]
       read_only_fields = ['balance', 'created_at', 'updated_at']

   def get_transaction_count(self, obj):
       return obj.transactions.count()

   def validate_name(self, value):
       user = self.context['request'].user
       qs = Account.objects.filter(user=user, name=value)

       if self.instance:
           qs = qs.exclude(pk=self.instance.pk)

       if qs.exists():
           raise serializers.ValidationError("You already have an account with this name.")

       return value

class TransactionSerializer(serializers.ModelSerializer):
   account_name = serializers.CharField(source='account.name', read_only=True)
   category_name = serializers.CharField(source='category.name', read_only=True)
   category_color = serializers.CharField(source='category.color', read_only=True)
   transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

   class Meta:
       model = Transaction
       fields = [
           'id', 'account', 'account_name', 'category', 'category_name', 'category_color',
           'transaction_type', 'transaction_type_display', 'amount', 'description',
           'notes', 'date', 'created_at', 'updated_at'
       ]
       read_only_fields = ['created_at', 'updated_at']

   def validate_amount(self, value):
       if value <= 0:
           raise serializers.ValidationError("Amount must be greater than zero.")
       return value

   def validate_account(self, value):
       if value.user != self.context['request'].user:
           raise serializers.ValidationError("You can only create transactions for your own accounts.")
       return value

   def validate_category(self, value):
       if value and value.user != self.context['request'].user:
           raise serializers.ValidationError("You can only use your own categories.")
       return value
