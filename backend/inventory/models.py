from django.db import models
from books.models import BookModel

class Shelf(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class BookCopy(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("issued", "Issued"),
        ("reserved", "Reserved"),
        ("lost", "Lost"),
        ("damaged", "Damaged"),
    ]

    book = models.ForeignKey(BookModel, on_delete=models.CASCADE)
    shelf = models.ForeignKey(Shelf, on_delete= models.SET_NULL, null=True, blank=True)
    copy_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    added_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.title} ({self.copy_number}) - {self.status}"