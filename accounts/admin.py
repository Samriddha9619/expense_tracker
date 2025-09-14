from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ['email','username','first_name','last_name','is_active','created_at']
    list_filter=['is_active','is_staff','created_at']
    search_fields= ['email','username','first_name','last_name']
    ordering=['-created_at']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone', 'created_at', 'updated_at')
        }),
    )
    readonly_fields = ['created_at', 'updated_at']

admin.site.register(User,UserAdmin)