from rest_framework.permissions import BasePermission

# Only allow admins
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

# Only allow normal users (non-admin)
class IsUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and not request.user.is_staff