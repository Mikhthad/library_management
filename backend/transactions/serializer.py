from rest_framework import serializers
from .models import Transaction,Fine,Payment

class TransactionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source = 'member.user.username', read_only = True)
    book_title = serializers.CharField(source = 'book_copy.book.title', read_only = True)
    copy_number = serializers.CharField(source = 'book_copy.copy_number', read_only = True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "member",
            "member_name",
            "book_copy",
            "copy_number",
            "book_title",
            "issue_date",
            "due_date",
            "return_date",
            "fine_amount",
            "status",
            "notes"
        ]

class FineSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source = 'member.user.username', read_only = True)
    book_title = serializers.CharField(source = 'transaction.book_copy.book.title', read_only = True)
    transaction_id = serializers.IntegerField(source = 'transaction.id', read_only = True)
    class Meta:
        model = Fine
        fields = [
            "id",
            "member",
            "member_name",
            "transaction",
            "transaction_id",
            "book_title",
            "amount",
            "reason",
            "is_paid",
            "created_at"
        ]

class PaymentSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source = 'fine.member.user.username', read_only = True)
    book_title = serializers.CharField(source = 'fine.transaction.book_copy.book.title', read_only = True)
    fine_amount = serializers.DecimalField(source = 'fine.amount', max_digits=8, decimal_places=2, read_only = True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "fine",
            "member_name",
            "book_title",
            "fine_amount",
            "amount_paid",
            "payment_mode",
            "receipt_no",
            "paid_at"
        ]