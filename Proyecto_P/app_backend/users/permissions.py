from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """
    Permiso personalizado para verificar si el usuario es superusuario.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class IsEditor(BasePermission):
    """
    Permiso personalizado para verificar si el usuario es editor.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff and not request.user.is_superuser)

class IsOwnerOrAdmin(BasePermission):
    """
    Permiso personalizado que permite a los usuarios actualizar su propio perfil
    o a los administradores actualizar cualquier perfil.
    """
    def has_object_permission(self, request, view, obj):
        return request.user == obj or request.user.is_superuser
