from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Transaction, Account

@receiver(post_save, sender=Transaction)
def update_account_balance_on_transaction_save(sender, instance, **kwargs):
    """Update account balance when transaction is saved"""
    account = instance.account
    account.balance = account.calculate_balance()
    account.save(update_fields=['balance'])

@receiver(post_delete, sender=Transaction)
def update_account_balance_on_transaction_delete(sender, instance, **kwargs):
    """Update account balance when transaction is deleted"""
    account = instance.account
    account.balance = account.calculate_balance()
    account.save(update_fields=['balance'])
