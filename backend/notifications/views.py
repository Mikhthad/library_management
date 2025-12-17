from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permission import IsAdminOrLibrarian
from users.auth import CsrfExemptSessionAuthentication
from .models import Notification
from .serializer import NotificationSerializer


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def mark_read(request, id):
    notification = get_object_or_404(Notification, id=id, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({"detail": "Notification marked as read"})


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def create_notification(request):
    serializer = NotificationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()   # or .save(user=request.user) depending on your model
        return Response({"detail": "Notification sent"}, status=200)
    return Response(serializer.errors, status=400)
