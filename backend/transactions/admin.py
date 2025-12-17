from django.contrib import admin
from .models import Transaction, Fine, Payment


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "member",
        "book_copy",
        "status",
        "issue_date",
        "due_date",
        "return_date",
        "fine_amount",
    )
    list_filter = ("status", "issue_date", "due_date")
    search_fields = (
        "member__user__username",
        "book_copy__copy_number",
    )
    ordering = ("-issue_date",)


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "member",
        "transaction",
        "amount",
        "is_paid",
        "created_at",
    )
    list_filter = ("is_paid", "created_at")
    search_fields = (
        "member__user__username",
        "transaction__book_copy__copy_number",
    )
    ordering = ("-created_at",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "fine",
        "amount_paid",
        "payment_mode",
        "receipt_no",
        "paid_at",
    )
    list_filter = ("payment_mode", "paid_at")
    search_fields = ("receipt_no",)
    ordering = ("-paid_at",)
