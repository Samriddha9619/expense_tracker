from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Category, Account, Transaction
from .serializers import CategorySerializer, AccountSerializer, TransactionSerializer

class CategoryViewSet(viewsets.ModelViewSet):
   serializer_class = CategorySerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
       return Category.objects.filter(user=self.request.user)

   def perform_create(self, serializer):
       serializer.save(user=self.request.user)

   @action(detail=True, methods=['get'])
   def transactions(self, request, pk=None):
       category = self.get_object()
       transactions = category.transactions.all()
       serializer = TransactionSerializer(transactions, many=True)
       return Response(serializer.data)
class AccountViewSet(viewsets.ModelViewSet):
   serializer_class = AccountSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
       return Account.objects.filter(user=self.request.user)

   def perform_create(self, serializer):
       serializer.save(user=self.request.user)

   @action(detail=True, methods=['get'])
   def transactions(self, request, pk=None):
       account = self.get_object()
       transactions = account.transactions.all()
       serializer = TransactionSerializer(transactions, many=True)
       return Response(serializer.data)

   @action(detail=True, methods=['get'])
   def balance(self, request, pk=None):
       account = self.get_object()

       # Calculate income and expense totals
       income_total = account.transactions.filter(transaction_type='income').aggregate(
           Sum('amount'))['amount__sum'] or 0
       expense_total = account.transactions.filter(transaction_type='expense').aggregate(
           Sum('amount'))['amount__sum'] or 0

       return Response({
           'account_name': account.name,
           'current_balance': float(account.balance),
           'total_income': float(income_total),
           'total_expenses': float(expense_total),
           'transaction_count': account.transactions.count()
       })

class TransactionViewSet(viewsets.ModelViewSet):
  
   serializer_class = TransactionSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
       return Transaction.objects.filter(user=self.request.user)

   def perform_create(self, serializer):
       serializer.save(user=self.request.user)

   @action(detail=False, methods=['get'])
   def summary(self, request):
       queryset = self.get_queryset()

       total_income = queryset.filter(transaction_type='income').aggregate(
           Sum('amount'))['amount__sum'] or 0
       total_expenses = queryset.filter(transaction_type='expense').aggregate(
           Sum('amount'))['amount__sum'] or 0

       return Response({
           'total_income': float(total_income),
           'total_expenses': float(total_expenses),
           'net_amount': float(total_income - total_expenses),
           'transaction_count': queryset.count(),
           'income_count': queryset.filter(transaction_type='income').count(),
           'expense_count': queryset.filter(transaction_type='expense').count(),
       })
