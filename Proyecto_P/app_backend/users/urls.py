from django.urls import path
from .views import (
    ToggleUserActiveView,
    RegisterUserView,
    ProfileView,
    ListUsersView,
    DeleteUserView,
    UpdateUserView,
    CustomTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('perfil/', ProfileView.as_view(), name='perfil_user'),
    path('listusers/', ListUsersView.as_view(), name='list-users'),
    path('toggle-active/<int:pk>/', ToggleUserActiveView.as_view(), name='toggle-active-user'),
    path('delete-user/<int:pk>/', DeleteUserView.as_view(), name='delete-user'),
    path('update-user/<int:pk>/', UpdateUserView.as_view(), name='update-user'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
