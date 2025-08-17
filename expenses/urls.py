from django.urls import path,include
from rest_framework import DefaultRouter
from .import views


router =  DefaultRouter()
router.register(r'categories',views.CategoryViewSet,basename='category')
urlpatterns=[

]