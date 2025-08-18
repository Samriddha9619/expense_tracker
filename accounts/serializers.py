from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
class UserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User

        fields=['id','username','email','first_name','last_name','created_at',]
        read_only_fields = ['id','created_at']

class UserRegiSerializer(serializers.ModelSerializer):
    password= serializers.CharField(write_only=True,style={'input_type':'password'})
    password_confirm= serializers.CharField(write_only=True,style={'input_type':'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'password', 'password_confirm']


    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate_username(self,value):
        if User.objects.filter(usernmae=value).exists():
            raise serializers.ValidationError("A user with same username already exists.")
        return value
    
    def validate(self, attrs):
        password=attrs.get('password')
        password_confirm=attrs.get('password_confirm')
        if password!=password_confirm:
            raise serializers.ValidationError("Password don't match.")
        try:
            validate_password(password,self.instance)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    #loginserializer
    #password_change_serializer
