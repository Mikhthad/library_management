from rest_framework.permissions import BasePermission

class isAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_staff or user.is_superuser:
            return True

        if hasattr(user, "memberprofile"):
            return user.memberprofile.role == "admin"

        return False


class IsAdminOrLibrarian(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        try:
            profile = request.user.memberprofile
            return profile.role in ["admin", "librarian"]
        except:
            return False