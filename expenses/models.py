from django.db import models

# Create your models here.
from django.contrib.auth import get_user_model

User =get_user_model()

TRANSACTION_TYPES = [
    ('income', 'Income'),
    ('expense', 'Expense'),
    ('transfer', 'Transfer'),
]

ACCOUNT_TYPES = [
    ('checking', 'Checking'),
    ('savings', 'Savings'),
    ('credit_card', 'Credit Card'),
    ('cash', 'Cash'),
    ('investment', 'Investment'),
    ('other', 'Other'),
]

class Category(models.Model):
    name=models.CharField(max_length=100)
    description= models.TextField(blank=True)
    color=models.CharField(max_length=7, default='#007bff')  # Hex color code
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='categories')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    


class Account(models.Model):
    name= models.CharField(max_length=100)
    account_type=models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance= models.DecimalField(max_digits=12,decimal_places=2,default=0.00)
    description=models.TextField(blank=True)
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='accounts')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_balance(self):
        """Calculate the current balance based on transactions"""
        # Only calculate if account already exists (has an ID)
        if not self.pk:
            return 0.00
        
        from django.db.models import Sum
        income = self.transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        expenses = self.transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or 0
        return float(income - expenses)
    
    def save(self, *args, **kwargs):
        # Only update balance if account already exists
        if self.pk:
            self.balance = self.calculate_balance()
        super().save(*args, **kwargs)

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

