from django.contrib import admin
from .models import BookModel,Category, Wishlist, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(BookModel)
class BookModelAdmin(admin.ModelAdmin):
    list_display = ('id','title','author','isbn','category','publication_year','created_at')
    list_filter = ('title','author','category')
    search_fields = ('publication_year','title','author','category')

admin.site.register(Wishlist)
admin.site.register(Review)