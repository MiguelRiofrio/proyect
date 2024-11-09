# users/permissions.py

from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """
    Permiso personalizado para verificar si el usuario es superusuario.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)
