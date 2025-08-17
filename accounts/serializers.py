from rest_framework import serializers
from .models import User

class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User

        fields=['id','username','email','first_name','last_name','created_at',]
        #read_only_fields = ['id','created_at']