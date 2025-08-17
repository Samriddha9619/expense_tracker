from django.db import models

# Create your models here.
from django.contrib.auth import get_user_model

User =get_user_model()

class Category(models.Model):
    name=models.CharField(max_length=100)
    description= models.TextField(blank=True)
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='categories')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    #class Meta:


class Account(models.Model):
    name= models.CharField(max_length=100)
    account_type=models.CharField(max_length=20)
    balance= models.DecimalField(max_digits=12,decimal_places=2,default=0.00)
    description=models.TextField(blank=True)
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='accounts')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    transaction_type = models.CharField(max_length=20,)# choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

