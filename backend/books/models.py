from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class BookModel(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    isbn = models.CharField(max_length=13, unique=True)
    genre = models.CharField(max_length=100)
    publication_year = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    available = models.BooleanField(default=True)
    shelf = models.ForeignKey("inventory.Shelf", on_delete=models.CASCADE)
    uploaded_files = models.FileField(upload_to='book-files/', null=True, blank=True) 
    coverimg = models.ImageField(upload_to='covers/',null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} - {self.author}'
    
class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(BookModel, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['user','book']

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(BookModel, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
