from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
# Create your views here.
from rest_framework import viewsets,status

from .models import Category,Transaction,Account
from .serializers import CategorySerializer, Account_serializers, TransactionSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class=CategorySerializer

    def get_queryset(self):
        return Category.objects.all()
    @action(detail=True,method=['get'])
    def transactions(self,request,pk=None):
        category=self.get_object()
        transactions = category.transactions.all()
        serializer = TransactionSerializer(transactions,many=True)
        return Response(serializer.data)


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class=Account_serializers
    
    def get_queryset(self):
        return Account.objects.all()
    
    @action(detail=True,method=['get'])
    def transactions(self,request,pk=None):
        account=self.get_object()
        transactions=account.transactions.all()
        serializer=TransactionSerializer(transactions,many=True)
        return Response(serializer.data)
    
    '''@action(detail=True,methods=['get'])
    def balance(self,request,pk=None):
        account=self.get_object()
        '''
    
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class=TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.all()
    
