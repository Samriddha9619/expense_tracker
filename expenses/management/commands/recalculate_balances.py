from django.core.management.base import BaseCommand
from expenses.models import Account

class Command(BaseCommand):
    help = 'Recalculate all account balances based on transactions'

    def handle(self, *args, **options):
        accounts = Account.objects.all()
        updated_count = 0
        
        for account in accounts:
            old_balance = account.balance
            account.balance = account.calculate_balance()
            account.save(update_fields=['balance'])
            
            if old_balance != account.balance:
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {account.name}: ${old_balance} → ${account.balance}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} account balances')
        )
