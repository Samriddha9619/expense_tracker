from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Category, Account, Transaction
from .serializers import CategorySerializer, AccountSerializer, TransactionSerializer
from decouple import config
from decimal import Decimal

class CategoryViewSet(viewsets.ModelViewSet):
   serializer_class = CategorySerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
       return Category.objects.filter(user=self.request.user).order_by('-created_at')

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
       return Account.objects.filter(user=self.request.user).order_by('-created_at')

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
       queryset = Transaction.objects.filter(user=self.request.user).order_by('-date', '-created_at')
       
       # Filter by category if provided
       category_id = self.request.query_params.get('category', None)
       if category_id:
           queryset = queryset.filter(category_id=category_id)
       
       # Filter by transaction type if provided
       transaction_type = self.request.query_params.get('transaction_type', None)
       if transaction_type:
           queryset = queryset.filter(transaction_type=transaction_type)
       
       # Filter by account if provided
       account_id = self.request.query_params.get('account', None)
       if account_id:
           queryset = queryset.filter(account_id=account_id)
       
       # Filter by date range if provided
       start_date = self.request.query_params.get('start_date', None)
       end_date = self.request.query_params.get('end_date', None)
       if start_date:
           queryset = queryset.filter(date__gte=start_date)
       if end_date:
           queryset = queryset.filter(date__lte=end_date)
       
       return queryset

   def perform_create(self, serializer):
       serializer.save(user=self.request.user)

   @action(detail=False, methods=['get'])
   def summary(self, request):
       queryset = self.get_queryset()

       total_income = queryset.filter(transaction_type='income').aggregate(
           Sum('amount'))['amount__sum'] or 0
       total_expenses = queryset.filter(transaction_type='expense').aggregate(
           Sum('amount'))['amount__sum'] or 0
       # Include transfers as expenses (money leaving accounts)
       total_transfers = queryset.filter(transaction_type='transfer').aggregate(
           Sum('amount'))['amount__sum'] or 0

       return Response({
           'total_income': float(total_income),
           'total_expenses': float(total_expenses + total_transfers),
           'net_amount': float(total_income - total_expenses - total_transfers),
           'transaction_count': queryset.count(),
           'income_count': queryset.filter(transaction_type='income').count(),
           'expense_count': queryset.filter(transaction_type='expense').count(),
           'transfer_count': queryset.filter(transaction_type='transfer').count(),
       })

   @action(detail=False, methods=['get'])
   def ai_insights(self, request):
       """Generate AI-powered financial insights and recommendations using Google Gemini"""
       try:
           import google.generativeai as genai
           import json
       except ImportError as e:
           return Response({
               'error': f'Google Generative AI library not installed: {str(e)}. Run: pip install google-generativeai'
           }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

       try:
           # Check for API key
           api_key = config('GEMINI_API_KEY', default=None)
           if not api_key:
               return Response({
                   'error': 'GEMINI_API_KEY not set in environment variables. Get one free at https://makersuite.google.com/app/apikey'
               }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

           # Get user's transactions
           queryset = self.get_queryset()
           
           # Calculate date ranges
           today = timezone.now().date()
           last_30_days = today - timedelta(days=30)
           last_60_days = today - timedelta(days=60)
           
           # Current month data
           current_month_transactions = queryset.filter(date__gte=last_30_days)
           current_income = current_month_transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           current_expenses = current_month_transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           current_transfers = current_month_transactions.filter(transaction_type='transfer').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           
           # Previous month data for comparison
           previous_month_transactions = queryset.filter(date__gte=last_60_days, date__lt=last_30_days)
           previous_income = previous_month_transactions.filter(transaction_type='income').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           previous_expenses = previous_month_transactions.filter(transaction_type='expense').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           previous_transfers = previous_month_transactions.filter(transaction_type='transfer').aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           
           # Category breakdown
           category_expenses = current_month_transactions.filter(
               transaction_type='expense'
           ).values('category__name').annotate(
               total=Sum('amount')
           ).order_by('-total')[:5]
           
           # Additional analytics
           # Weekly spending pattern
           last_7_days = today - timedelta(days=7)
           last_7_days_expenses = queryset.filter(
               date__gte=last_7_days, 
               transaction_type='expense'
           ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           last_7_days_transfers = queryset.filter(
               date__gte=last_7_days,
               transaction_type='transfer'
           ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           
           # Average transaction size
           avg_expense = current_month_transactions.filter(
               transaction_type='expense'
           ).aggregate(Avg('amount'))['amount__avg'] or Decimal('0')
           
           # Transaction frequency
           expense_count = current_month_transactions.filter(transaction_type='expense').count()
           income_count = current_month_transactions.filter(transaction_type='income').count()
           
           # Category count (spending diversity)
           unique_categories = current_month_transactions.filter(
               transaction_type='expense'
           ).values('category').distinct().count()
           
           # Largest single expense
           largest_expense = current_month_transactions.filter(
               transaction_type='expense'
           ).order_by('-amount').first()
           
           # Fixed vs variable expenses (transactions over $100 vs under)
           large_expenses = current_month_transactions.filter(
               transaction_type='expense', 
               amount__gte=100
           ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           small_expenses = current_month_transactions.filter(
               transaction_type='expense',
               amount__lt=100
           ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
           
           # Prepare data for AI
           spending_data = {
               'current_month': {
                   'income': float(current_income),
                   'expenses': float(current_expenses + current_transfers),
                   'balance': float(current_income - current_expenses - current_transfers)
               },
               'previous_month': {
                   'income': float(previous_income),
                   'expenses': float(previous_expenses + previous_transfers),
                   'balance': float(previous_income - previous_expenses - previous_transfers)
               },
               'top_categories': [
                   {'category': item['category__name'] or 'Uncategorized', 'amount': float(item['total'])}
                   for item in category_expenses
               ],
               'analytics': {
                   'weekly_burn_rate': float(last_7_days_expenses + last_7_days_transfers),
                   'avg_expense': float(avg_expense),
                   'expense_count': expense_count,
                   'income_count': income_count,
                   'unique_categories': unique_categories,
                   'largest_expense': float(largest_expense.amount) if largest_expense else 0,
                   'large_expenses': float(large_expenses),
                   'small_expenses': float(small_expenses)
               }
           }
           
           # Generate smart insights without AI API
           insights = []
           
           # Get the data
           current_income = spending_data['current_month']['income']
           current_expenses = spending_data['current_month']['expenses']
           current_balance = spending_data['current_month']['balance']
           previous_income = spending_data['previous_month']['income']
           previous_expenses = spending_data['previous_month']['expenses']
           
           income_change = current_income - previous_income
           expense_change = current_expenses - previous_expenses
           
           # Only show meaningful insights (skip if no previous data or first month)
           has_previous_data = previous_expenses > 0 or previous_income > 0
           
           # 1. Overall Financial Health - Always show this first
           if current_balance > 0:
               savings_rate = (current_balance / current_income * 100) if current_income > 0 else 0
               if savings_rate >= 20:
                   insights.append({
                       'title': '🌟 Excellent Financial Health!',
                       'message': f"You're saving {savings_rate:.1f}% of your income (${current_balance:.2f} this month). That's above the recommended 20%! You're building wealth effectively."
                   })
               elif savings_rate >= 10:
                   insights.append({
                       'title': '✅ Good Financial Health',
                       'message': f"You're saving {savings_rate:.1f}% of your income (${current_balance:.2f}). Try to increase this to 20% for optimal financial security. You're on the right track!"
                   })
               else:
                   insights.append({
                       'title': '💡 Room for Improvement',
                       'message': f"You're saving {savings_rate:.1f}% of your income (${current_balance:.2f}). Financial experts recommend saving 20%. Look at your expenses to find savings opportunities."
                   })
           else:
               deficit = abs(current_balance)
               if deficit > current_income * 0.5:
                   insights.append({
                       'title': '� Critical Budget Alert',
                       'message': f"You're ${deficit:.2f} over budget (spending {(current_expenses/current_income*100):.0f}% more than you earn). This is unsustainable. Prioritize only essential expenses immediately."
                   })
               else:
                   insights.append({
                       'title': '⚠️ Budget Deficit',
                       'message': f"You're ${deficit:.2f} over budget this month. Review your non-essential expenses and try to cut back where possible to avoid debt."
                   })
           
           # 2. Spending Trend (only if we have previous data)
           if has_previous_data and abs(expense_change) > 100:  # Only if change is significant
               if expense_change > 0:
                   change_percent = (expense_change / previous_expenses * 100) if previous_expenses > 0 else 0
                   if change_percent > 30:
                       insights.append({
                           'title': '📈 Major Spending Increase',
                           'message': f"Your expenses jumped by ${expense_change:.2f} ({change_percent:.0f}% increase). This is a significant change. Was this planned (like a big purchase) or unexpected?"
                       })
                   elif change_percent > 10:
                       insights.append({
                           'title': '📊 Spending Up',
                           'message': f"Your expenses increased by ${expense_change:.2f} ({change_percent:.0f}% increase). Review your top categories to see what drove this change."
                       })
               else:
                   change_percent = (abs(expense_change) / previous_expenses * 100) if previous_expenses > 0 else 0
                   insights.append({
                       'title': '🎉 Great Job! Spending Down',
                       'message': f"You reduced expenses by ${abs(expense_change):.2f} ({change_percent:.0f}% decrease). Excellent discipline! Keep this momentum going."
                   })
           
           # 3. Category Analysis - Make it actionable
           if spending_data['top_categories']:
               top_cat = spending_data['top_categories'][0]
               category_percent = (top_cat['amount'] / current_expenses * 100) if current_expenses > 0 else 0
               
               # Smart category advice based on typical spending patterns
               category_name = (top_cat['category'] or '').lower()
               if category_percent > 50:
                   insights.append({
                       'title': f'🔍 {top_cat["category"]} Dominates Budget',
                       'message': f"{top_cat['category']} is {category_percent:.0f}% of your spending (${top_cat['amount']:.2f}). This seems unusually high. Was this a one-time expense or recurring?"
                   })
               elif 'food' in category_name or 'dining' in category_name or 'restaurant' in category_name:
                   insights.append({
                       'title': f'🍽️ {top_cat["category"]} Spending',
                       'message': f"You spent ${top_cat['amount']:.2f} on {top_cat['category']}. Meal prepping and cooking at home can save 40-60% on food costs."
                   })
               elif 'transport' in category_name or 'gas' in category_name or 'car' in category_name:
                   insights.append({
                       'title': f'🚗 {top_cat["category"]} Costs',
                       'message': f"${top_cat['amount']:.2f} went to {top_cat['category']}. Consider carpooling, public transit, or route optimization to reduce costs."
                   })
               elif 'entertainment' in category_name or 'shopping' in category_name:
                   insights.append({
                       'title': f'🎯 {top_cat["category"]} Spending',
                       'message': f"${top_cat['amount']:.2f} on {top_cat['category']}. These discretionary expenses offer the best opportunity for quick savings if needed."
                   })
               else:
                   insights.append({
                       'title': f'📌 Top Category: {top_cat["category"]}',
                       'message': f"${top_cat['amount']:.2f} ({category_percent:.0f}% of expenses) went to {top_cat['category']}. Focus optimization efforts here for maximum impact."
                   })
           
           # 4. Income insights (only if meaningful change)
           if has_previous_data and abs(income_change) > 100:
               if income_change > 0:
                   insights.append({
                       'title': '💰 Income Boost',
                       'message': f"Your income increased by ${income_change:.2f}! Consider the 50/30/20 rule: allocate 50% to needs, 30% to wants, and 20% to savings/debt."
                   })
               elif income_change < 0:
                   insights.append({
                       'title': '📉 Income Dip',
                       'message': f"Income decreased by ${abs(income_change):.2f}. Focus on essential expenses only and consider ways to supplement income if this continues."
                   })
           
           # 5. Actionable next step
           if current_balance > current_expenses:
               insights.append({
                   'title': '🎯 Action: Build Emergency Fund',
                   'message': f"You have strong savings (${current_balance:.2f})! Aim for 3-6 months of expenses (${current_expenses*3:.2f}-${current_expenses*6:.2f}) in an emergency fund."
               })
           elif current_balance > 0 and current_balance < current_expenses * 3:
               insights.append({
                   'title': '🎯 Action: Increase Emergency Fund',
                   'message': f"Keep building that emergency fund! Target: ${current_expenses*3:.2f} (3 months expenses). You're {(current_balance/(current_expenses*3)*100):.0f}% there."
               })
           elif current_balance < 0:
               insights.append({
                   'title': '🎯 Action: Stop the Bleeding',
                   'message': f"Priority: Cut non-essential spending immediately. Review subscriptions, dining out, and entertainment. Every dollar counts right now."
               })
           
           # 6. Weekly Spending Pattern (Burn Rate)
           weekly_burn = spending_data['analytics']['weekly_burn_rate']
           if weekly_burn > 0:
               projected_monthly = weekly_burn * 4.33  # Average weeks per month
               if projected_monthly > current_expenses * 1.2:
                   insights.append({
                       'title': '🔥 High Burn Rate Alert',
                       'message': f"Last 7 days: ${weekly_burn:.2f} spent. At this pace, you'll spend ${projected_monthly:.2f} this month (vs ${current_expenses:.2f} average). Slow down!"
                   })
               elif projected_monthly < current_expenses * 0.8:
                   insights.append({
                       'title': '✨ Great Spending Control',
                       'message': f"Last 7 days: ${weekly_burn:.2f}. At this pace (${projected_monthly:.2f}/month), you're spending less than usual. Keep it up!"
                   })
           
           # 7. Transaction Behavior Analysis
           avg_expense = spending_data['analytics']['avg_expense']
           expense_count = spending_data['analytics']['expense_count']
           if expense_count > 0:
               if avg_expense < 20:
                   insights.append({
                       'title': '💳 Small Purchase Pattern',
                       'message': f"You made {expense_count} transactions averaging ${avg_expense:.2f}. Many small purchases add up! Consider a daily spending limit."
                   })
               elif avg_expense > 100:
                   insights.append({
                       'title': '💰 Large Purchase Pattern',
                       'message': f"Average transaction: ${avg_expense:.2f} across {expense_count} purchases. You tend to make fewer, larger purchases - ensure each one is necessary."
                   })
               
               # Transaction frequency
               daily_transactions = expense_count / 30
               if daily_transactions > 3:
                   insights.append({
                       'title': '📊 Frequent Spender',
                       'message': f"You make {daily_transactions:.1f} transactions daily. Each swipe is a decision - try bundling purchases to reduce impulse spending."
                   })
           
           # 8. Spending Diversity
           unique_cats = spending_data['analytics']['unique_categories']
           if unique_cats > 8:
               insights.append({
                   'title': '🎨 Diverse Spending',
                   'message': f"You're spending across {unique_cats} categories. While varied, this makes budgeting harder. Focus on consolidating similar expenses."
               })
           elif unique_cats <= 3 and current_expenses > 0:
               insights.append({
                   'title': '🎯 Focused Spending',
                   'message': f"Only {unique_cats} spending categories. This focus makes budgeting easier and helps identify cost-saving opportunities."
               })
           
           # 9. Large vs Small Expenses (Fixed vs Variable)
           large_exp = spending_data['analytics']['large_expenses']
           small_exp = spending_data['analytics']['small_expenses']
           if large_exp > 0 and small_exp > 0:
               large_percent = (large_exp / current_expenses * 100) if current_expenses > 0 else 0
               if large_percent > 70:
                   insights.append({
                       'title': '🏠 Fixed Expense Heavy',
                       'message': f"{large_percent:.0f}% of spending is large transactions ($100+). These fixed costs limit flexibility. Look for ways to reduce big-ticket items."
                   })
               elif large_percent < 30:
                   insights.append({
                       'title': '🔄 Variable Expense Heavy',
                       'message': f"{100-large_percent:.0f}% of spending is small transactions. These variable costs are easier to control - great opportunity for savings!"
                   })
           
           # 10. Largest Expense Warning
           largest = spending_data['analytics']['largest_expense']
           if largest > current_expenses * 0.3 and largest > 0:
               insights.append({
                   'title': '⚠️ Large Single Expense Detected',
                   'message': f"Your biggest expense was ${largest:.2f} ({(largest/current_expenses*100):.0f}% of total spending). Was this planned? Consider spreading large purchases across months."
               })
           
           # 11. Income Streams
           income_count = spending_data['analytics']['income_count']
           if income_count == 1 and current_income > 0:
               insights.append({
                   'title': '💼 Single Income Stream',
                   'message': f"You have 1 income source. Consider building a side income or emergency fund to protect against job loss or income disruption."
               })
           elif income_count > 3:
               insights.append({
                   'title': '🌟 Multiple Income Streams',
                   'message': f"Excellent! You have {income_count} income sources. This diversification provides financial security and resilience."
               })
           
           # 12. Savings Rate Benchmark
           if current_income > 0:
               savings_rate = (current_balance / current_income * 100)
               if savings_rate >= 30:
                   insights.append({
                       'title': '🏆 Elite Saver',
                       'message': f"{savings_rate:.0f}% savings rate! You're in the top 10% of savers. You're on track for early financial independence and wealth building."
                   })
               elif savings_rate < 0:
                   deficit_rate = abs(savings_rate)
                   insights.append({
                       'title': '🚨 Negative Savings Rate',
                       'message': f"You're spending {deficit_rate:.0f}% more than you earn. This can't continue. Make an immediate plan to cut expenses by at least ${abs(current_balance):.2f}."
                   })
           
           # 13. Budget Allocation Recommendation (50/30/20 rule)
           if current_income > 0:
               needs_target = current_income * 0.5
               wants_target = current_income * 0.3
               savings_target = current_income * 0.2
               
               insights.append({
                   'title': '📊 Ideal Budget Breakdown (50/30/20)',
                   'message': f"Based on ${current_income:.2f} income: Needs=${needs_target:.2f} (50%), Wants=${wants_target:.2f} (30%), Savings=${savings_target:.2f} (20%). Compare to your actual spending!"
               })
           
           # 14. Spending vs Previous Month Velocity
           if has_previous_data and previous_expenses > 0:
               velocity = ((current_expenses - previous_expenses) / previous_expenses * 100)
               if abs(velocity) > 50:
                   insights.append({
                       'title': '⚡ Extreme Spending Velocity',
                       'message': f"Your spending {'increased' if velocity > 0 else 'decreased'} by {abs(velocity):.0f}% vs last month. This is unusual. Review what changed in your life or finances."
                   })
           
           # 15. Cash Flow Projection
           if current_income > 0 and current_expenses > 0:
               monthly_surplus = current_balance
               if monthly_surplus > 0:
                   months_to_1k = 1000 / monthly_surplus if monthly_surplus > 0 else float('inf')
                   if months_to_1k <= 3:
                       insights.append({
                           'title': '💎 Quick Savings Goal',
                           'message': f"At your current pace (${monthly_surplus:.2f}/month), you'll save $1,000 in {months_to_1k:.1f} months. Set this as your first milestone!"
                       })
                   
                   # Project annual savings
                   annual_savings = monthly_surplus * 12
                   insights.append({
                       'title': '📅 Annual Projection',
                       'message': f"If you maintain this savings rate, you'll save ${annual_savings:.2f} this year. That's enough for emergencies, investments, or a major goal!"
                   })
           
           # 16. Weekend vs Weekday spending (if we have enough data)
           # This would require date analysis but we'll skip for now as it's complex
           
           # 17. Expense-to-Income Ratio
           if current_income > 0:
               expense_ratio = (current_expenses / current_income * 100)
               if expense_ratio > 100:
                   insights.append({
                       'title': '📛 Unsustainable Spending',
                       'message': f"You're spending {expense_ratio:.0f}% of your income. Anything over 100% means you're going into debt. Immediate action required!"
                   })
               elif expense_ratio > 80:
                   insights.append({
                       'title': '⚠️ High Expense Ratio',
                       'message': f"Spending {expense_ratio:.0f}% of income leaves little room for savings or emergencies. Aim for 70-80% to build financial cushion."
                   })
               elif expense_ratio < 50:
                   insights.append({
                       'title': '🎉 Low Expense Ratio',
                       'message': f"Only {expense_ratio:.0f}% of income goes to expenses! This gives you incredible financial flexibility and wealth-building potential."
                   })
           
           # 18. Top 3 Categories Insight
           if len(spending_data['top_categories']) >= 3:
               top_3_total = sum(cat['amount'] for cat in spending_data['top_categories'][:3])
               top_3_percent = (top_3_total / current_expenses * 100) if current_expenses > 0 else 0
               if top_3_percent > 60:
                   cat_names = ', '.join([cat['category'] for cat in spending_data['top_categories'][:3]])
                   insights.append({
                       'title': '🎯 Focus Your Optimization',
                       'message': f"Your top 3 categories ({cat_names}) are {top_3_percent:.0f}% of spending. Focus cost-cutting efforts here for maximum impact!"
                   })
           
           return Response({
               'insights': insights,
               'spending_data': spending_data,
               'generated_at': timezone.now().isoformat(),
               'source': 'calculation-based'
           })
           
       except Exception as e:
           import traceback
           error_trace = traceback.format_exc()
           print(f"AI Insights Error: {error_trace}")
           return Response({
               'error': f'Failed to generate insights: {str(e)}',
               'details': error_trace
           }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

