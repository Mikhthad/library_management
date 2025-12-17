from django.shortcuts import render,get_object_or_404
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.auth import CsrfExemptSessionAuthentication
from users.permission import IsAdminOrLibrarian
from .models import Reservation
from .serializer import ReservationSerializer
from users.models import MemberProfile
from books.models import BookModel
from django.utils.timezone import now
from datetime import timedelta
from notifications.models import Notification


def auto_cancel_expired():
    today = now().date()
    Reservation.objects.filter(
        status = 'active', expired_at__lt = today
    ).update(status = 'expired')

def notify_next_reservation(book):
    reservation = (
        Reservation.objects
        .filter(book=book, status='active')
        .order_by('created_at')
        .first()
    )

    if reservation:
        reservation.status = 'ready'
        reservation.notified = True
        reservation.save()

        Notification.objects.create(
            user=reservation.member.user,
            notif_type='reservation',
            message=f'Your reserved book "{book.title}" is now available.'
        )


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def list_reservations(request):
    auto_cancel_expired()
    reservation = Reservation.objects.all().order_by('-created_at')
    serializer = ReservationSerializer(reservation, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def add_reservation(request):
    user = request.user

    try:
        member = user.memberprofile
    except MemberProfile.DoesNotExist:
        return Response({"Member profile not found"}, status=400)
    book_id = request.data.get('book')
    days = int(request.data.get('days',3))
    

    if not book_id:
        return Response({"detail":"Member and Book are required"},status=400)
    
    if Reservation.objects.filter(
       member = member,
       book_id = book_id,
       status__in = ['active','ready']
    ).exists():
        return Response({"detail":"You already have an active reservation for this book."}, status=400)

    expired_at = now().date() + timedelta(days=days)

    reservation = Reservation.objects.create(
        member = member,
        book_id = book_id,
        expired_at = expired_at,
        status = 'active'
    )

    serializier = ReservationSerializer(reservation)
    return Response({"detail":"Reservation created", "reservation": serializier.data}, status=200)

@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def update_reservation_status(request,id):
    reservation = get_object_or_404(Reservation, id = id)
    status_value = request.data.get('status')

    if status_value not in ["cancelled", "fulfilled", "ready"]:
        return Response({"detail":"Invalid Status"},status=400)
    reservation.status = status_value
    reservation.save()
    serializer = ReservationSerializer(reservation)
    return Response({"detail":'Reservation updated',"reservation":serializer.data},status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def user_reservation_history(request):
    member = request.user.memberprofile
    reservation = Reservation.objects.filter(member = member).order_by("-created_at")
    serializer = ReservationSerializer(reservation, many = True)
    return Response(serializer.data, status=200)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, id):
    reservation = get_object_or_404(Reservation, id = id, member = request.user.memberprofile)
    if reservation.status != 'active':
        return Response({"detail":"Only active reservations can be cancelled"}, status=400)
    reservation.status = "cancelled"
    reservation.save()
    return Response({"detail":"Reservation cancelled successfully"}, status=200)

