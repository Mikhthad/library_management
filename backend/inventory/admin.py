from django.contrib import admin
from .models import Shelf,BookCopy

@admin.register(Shelf)
class ShelfAdmin(admin.ModelAdmin):
    list_display = ('id','name')
    search_fields = ('name',)

@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = ("id", "book", "copy_number", "status", "shelf", "added_date")
    list_filter = ("status", "shelf")
    search_fields = ("copy_number", "book__title")