from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .serializers import UserSerializer
from .permissions import IsSuperUser, IsEditor, IsOwnerOrAdmin
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# View para listar todos los usuarios (solo superusuarios)
class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSuperUser]

# Vista para eliminar usuarios (solo administradores)
class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "Usuario eliminado correctamente"}, status=status.HTTP_200_OK)

# Vista para habilitar o deshabilitar un usuario (solo administradores)
class ToggleUserActiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = not user.is_active
        user.save()

        return Response({"message": "Estado del usuario actualizado correctamente"}, status=status.HTTP_200_OK)

# Serializador personalizado para agregar 'role' al token JWT
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Añadir el rol del usuario al token
        if user.is_superuser:
            role = 'superuser'
        elif user.is_staff:
            role = 'editor'
        else:
            role = 'user'
        token['role'] = role
        
        return token

# Vista personalizada para obtener el token con el rol
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # Obtener el serializador y validar los datos
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Obtener los tokens usando el serializador
        tokens = serializer.validated_data
        
        # Obtener el rol del usuario
        user = serializer.user
        if user.is_superuser:
            role = 'superuser'
        elif user.is_staff:
            role = 'editor'
        else:
            role = 'user'
        
        # Devolver la respuesta con los tokens y el rol
        return Response({
            'refresh': tokens['refresh'],
            'access': tokens['access'],
            'role': role
        }, status=status.HTTP_200_OK)

# Vista para registrar nuevos usuarios (solo superusuarios)
class RegisterUserView(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            response_data = UserSerializer(user).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vista para actualizar usuarios
class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    lookup_field = 'pk'

# Vista para obtener y actualizar el perfil del usuario autenticado
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
