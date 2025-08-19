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
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(email=email, password=password)
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Email and password are required fields.")

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})


    def validate_old_password(self, value):
        user= self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value
    
    def validate(self, attrs):
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')
        if new_password != new_password_confirm:
            raise serializers.ValidationError("New password and confirm password do not match.")
        try:
            validate_password(new_password, self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})
        return attrs
    
    def save(self):
        user=self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user