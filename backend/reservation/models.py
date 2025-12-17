from django.db import models
from users.models import MemberProfile
from books.models import BookModel

class Reservation(models.Model):
    Status_Choices = [
        ("active", "Active"),
        ("ready", "ready for pickup"),
        ("fulfilled", "Fulfilled"),
        ("cancelled", 'Cancelled'),
        ("expired", "Expired")
    ]

    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE)
    book = models.ForeignKey(BookModel, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateField()
    status = models.CharField(max_length=20, choices=Status_Choices, default="active")
    notified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.member.user.username} -> {self.book.title} ({self.status})"