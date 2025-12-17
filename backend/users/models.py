from django.db import models
from django.contrib.auth.models import User

class MemberProfile(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("librarian", "Librarian"),
        ("member", "Member")
    ]

    PLAN_CHOICES = (
        ("basic", "Basic"),
        ("premium", "Premium"),
        ("student", "Student")
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    phone = models.CharField(max_length=20, blank= True)
    address = models.TextField(blank=True)
    membership_plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='basic')
    approved = models.BooleanField(default=False)
    joined_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

class Penalty(models.Model):
    member = models.ForeignKey(MemberProfile, on_delete=models.CASCADE)
    reason = models.TextField()
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    cleared = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.member.user.username} - {self.reason}'