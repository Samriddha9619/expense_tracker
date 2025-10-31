from rest_framework import status, generics,permissions
# Create your views here.
from .models import User
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import (UserSerializers,LoginSerializer,UserRegiSerializer,ChangePasswordSerializer)

@api_view(['POST'])
@permission_classes([AllowAny])

def register(request):
    print(f"Registration data received: {request.data}")
    serializer= UserRegiSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializers(user).data,
            'tokens':{
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully!'
        },status=status.HTTP_201_CREATED)
    print(f"Registration validation errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data,context={'request':request})
    if serializer.is_valid():
       user =serializer.validated_data['user']
       refresh=RefreshToken.for_user(user)
       return Response({
           'user': UserSerializers(user).data,
           'tokens': {
               'refresh': str(refresh), 
                'access': str(refresh.access_token),
              },
              'message': 'Login successful!'
       })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token= RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful!'}), 
    except Exception as e:
        return Response({'message': 'Logout successful!'},status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializers
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Password changed successfully!'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    