from rest_framework import viewsets
# Create your views here.
from .models import User

from .serializers import UserSerializers

class UserViewSet(viewsets.ReadOnlyModelViewSet):