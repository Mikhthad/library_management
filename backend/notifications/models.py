from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    NOTIF_TYPES = (
        ("email","Email"),
        ("sms","SMS"),
        ("push","Push Notification") 
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    notif_type = models.CharField(max_length=10, choices=NOTIF_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.notif_type}" 