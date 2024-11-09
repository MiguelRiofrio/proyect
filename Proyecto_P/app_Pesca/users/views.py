from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .serializers import UserSerializer
from .permissions import IsSuperUser
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# View for listing all users (superuser-only)
class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSuperUser]  # Solo superusuarios pueden acceder

class DeleteUserView(APIView):
    """
    Vista para eliminar usuarios.
    Solo los administradores pueden eliminar usuarios.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "Usuario eliminado correctamente"}, status=status.HTTP_200_OK)
    
class ToggleUserActiveView(APIView):
    """
    Vista para habilitar o deshabilitar un usuario.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]  # Solo administradores pueden cambiar el estado

    def patch(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = not user.is_active  # Cambia el estado actual
        user.save()

        return Response({"message": "Estado del usuario actualizado correctamente"}, status=status.HTTP_200_OK)

# Custom serializer to add 'role' to the JWT token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add user role to the token
        token['role'] = 'admin' if user.is_superuser else 'user'
        
        return token

# Custom view for handling token retrieval with added user role
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # Get the serializer and validate data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get tokens using the serializer
        tokens = serializer.validated_data
        
        # Obtain the user's role
        user = serializer.user
        role = 'admin' if user.is_superuser else 'user'
        
        # Return the response with tokens and role
        return Response({
            'refresh': tokens['refresh'],
            'access': tokens['access'],
            'role': role  # Include the user role in the response
        }, status=status.HTTP_200_OK)

# View for registering new users (superuser-only)
class RegisterUserView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]  # Solo superusuarios pueden acceder

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View for fetching the profile of the authenticated user
class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    # Return the authenticated user as the object
    def get_object(self):
        return self.request.user
