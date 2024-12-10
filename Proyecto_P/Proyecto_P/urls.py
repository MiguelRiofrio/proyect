
from django.contrib import admin
from django.urls import path, include
from app_Pesca.users.views import CustomTokenObtainPairView  # Importa tu vista personalizada
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('admin/', admin.site.urls),  # Ruta para el admin de Django
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # Usa la vista personalizada
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('app_Pesca.users.urls')),  # Incluye las rutas de la app users
    path('api/', include('app_Pesca.urls')),  # Incluir las rutas de la aplicación de pesca
]
