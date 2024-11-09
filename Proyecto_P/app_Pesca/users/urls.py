# users/urls.py

from django.urls import path
from .views import ToggleUserActiveView, RegisterUserView, ProfileView, ListUsersView, DeleteUserView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('perfil/', ProfileView.as_view(), name='perfil_user'),
    path('listusers/', ListUsersView.as_view(), name='list-users'),
    path('toggle-active/<int:pk>/', ToggleUserActiveView.as_view(), name='toggle-active-user'),  # Nueva ruta para habilitar/deshabilitar
    path('delete-user/<int:pk>/', DeleteUserView.as_view(), name='delete-user'),  # Nueva ruta para eliminar

]
