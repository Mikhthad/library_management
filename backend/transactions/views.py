from django.shortcuts import render,get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated
from users.permission import isAdmin,IsAdminOrLibrarian
from users.auth import CsrfExemptSessionAuthentication
from datetime import date
import uuid
from .models import Transaction,Fine,Payment
from .serializer import TransactionSerializer, FineSerializer, PaymentSerializer
from inventory.models import BookCopy
from users.models import MemberProfile
from reservation.models import Reservation
from reservation.serializer import ReservationSerializer
from reservation.views import notify_next_reservation




@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def issue_book(request):
    member_id = request.data.get("member")
    book_copy_id = request.data.get('book_copy')
    due_date = request.data.get('due_date')

    if not all([member_id, book_copy_id, due_date]):
        return Response({"detail" : "member, book copy and due date are required"}, status=400)
    
    member = get_object_or_404(MemberProfile, id = member_id)
    book_copy = get_object_or_404(BookCopy, id = book_copy_id)

    if book_copy.status != 'available':
        return Response({"detail" : "Book copy is not available."}, status=400)
    
    serializer = TransactionSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        book_copy.status = "issued"
        book_copy.save()
        return Response({'detail': "Book issued successfully", "transaction" : serializer.data}, status=200)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def member_active_transactions(request, member_id):
    member = get_object_or_404(MemberProfile, id = member_id)
    transactions = Transaction.objects.filter(
        member = member,
        status = 'issued',
    ).order_by('-issue_date')

    serializer = TransactionSerializer(transactions, many = True)
    return Response(serializer.data, status=200)

@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def return_book(request, id):
    transaction = get_object_or_404(Transaction, id = id)
    book_copy = transaction.book_copy

    return_date = date.today()
    transaction.return_date = return_date
    transaction.status = 'returned'

    if return_date > transaction.due_date:
        late_days = (return_date - transaction.due_date).days
        fine_amount = late_days * 5
        transaction.fine_amount = fine_amount

        Fine.objects.create(
            member = transaction.member,
            transaction = transaction,
            amount = fine_amount,
            reason = f"late return - {late_days} days"
        )

    else:
        transaction.fine_amount = 0

    transaction.save()

    book_copy.status = 'available'
    book_copy.save()

    notify_next_reservation(book_copy.book)

    serializer = TransactionSerializer(transaction)
    return Response({
        "detail": "Book returned",
        "transaction": serializer.data
    }, status=200)
    


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def list_transactions(request):
    transaction = Transaction.objects.all().order_by("-issue_date")
    serializer = TransactionSerializer(transaction, many = True)
    return Response(serializer.data, status=200)


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def overdue_transactions(request):
    today = date.today()
    overdue = Transaction.objects.filter(
        due_date__lt=today,
        return_date__isnull=True
    )

    serializer = TransactionSerializer(overdue, many=True)
    return Response({
        "total_overdue": overdue.count(),
        "overdue_books": serializer.data
    })


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def dialy_borrow_stats(request):
    today = date.today()
    count = Transaction.objects.filter(
        issue_date__date = today
    ).count()
    return Response({"date": today, "total_borrows": count}, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def list_fines(request):
    fines = Fine.objects.all().order_by('-created_at')
    serializer = FineSerializer(fines, many = True)
    return Response(serializer.data, status=200)

@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def adjust_fine(request, id):
    fine = get_object_or_404(Fine, id = id)

    fine.amount = request.data.get('amount', fine.amount)
    fine.reason = request.data.get('reason', fine.reason)
    fine.save()
    return Response({"detail":"Fine update Successfully"}, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def pay_fine(request):
    fine_id = request.data.get('fine')
    payment_mode = request.data.get('payment_mode')

    if not all([fine_id,payment_mode]):
        return Response({"detail":"fine and paymnet_mode are required"}, status=400)
    
    fine = get_object_or_404(Fine, id = fine_id)

    if fine.is_paid:
        return Response({"detail":"fine already paid"}, status=400)
    fine.is_paid = True
    fine.save()

    payment = Payment.objects.create(
        fine = fine,
        amount_paid = fine.amount,
        payment_mode = payment_mode,
        receipt_no = str(uuid.uuid4())[:10]
    )
    seerializer = PaymentSerializer(payment)
    return Response({"detail":"Payment Successful", "receipt":seerializer.data}, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def user_borrow_history(request):
    member = request.user.memberprofile

    transactions = Transaction.objects.filter(
        member = member
    ).order_by('-issue_date')

    serializer = TransactionSerializer(transactions, many = True)
    return Response(serializer.data, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def my_fines(request):
    fines = Fine.objects.filter(member = request.user.memberprofile).order_by('-created_at')
    serializer = FineSerializer(fines, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def add_manual_fine(request):
    member_id = request.data.get('member')
    amount = request.data.get('amount')
    reason = request.data.get('reason')

    if not all([member_id, amount, reason]):
        return Response({"detail":"member, amount and reason are required"},status=400)
    
    member = get_object_or_404(MemberProfile, id = member_id)

    fine = Fine.objects.create(
        member = member,
        transaction = None,
        amount = amount,
        reason = reason,
        is_paid = False
    )

    serializer = FineSerializer(fine)
    return Response({'detail':"Manual Fine added", "fine": serializer.data}, status=201)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def delete_fine(request, id):
    fine  = get_object_or_404(Fine, id =id)
    if fine.is_paid:
        return Response({"detail":"Paid Cannot be deleted"})
    fine.delete()
    return Response({"detail":"Fine deleted successfully "}, status=200)