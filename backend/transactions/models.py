from django.db import models
from users.models import MemberProfile
from inventory.models import BookCopy


class Transaction(models.Model):
    Status_Choices = [
        ("issued","Issued"),
        ("returned","Returned"),
        ("overdue","Overdue"),
    ]

    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE)
    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE)
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    fine_amount = models.DecimalField(max_digits=6,decimal_places=2,default=0)
    status = models.CharField(max_length=20, choices=Status_Choices, default="issued")
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'{self.member.user.username} - {self.book_copy.copy_number} ({self.status})'
    
class Fine(models.Model):
    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    reason = models.CharField(max_length=250)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.member.user.username} - {self.amount}'

class Payment(models.Model):
    Payment_Method = [
        ('cash',"Cash"),
        ('upi',"UPI"),
        ("card","Card")
    ]
    fine = models.OneToOneField(Fine, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=8, decimal_places=2)
    payment_mode = models.CharField(max_length=20, choices=Payment_Method)
    receipt_no = models.CharField(max_length=50, unique=True)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.receipt_no