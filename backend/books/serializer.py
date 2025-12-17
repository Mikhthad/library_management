from rest_framework import serializers
from .models import BookModel,Category, Wishlist, Review
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class BookModelSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only = True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset = Category.objects.all(), write_only = True, source = 'category'
    )

    shelf = serializers.SerializerMethodField()
    shelf_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BookModel
        fields = [
            "id", "title", "author", "isbn","genre", "category", "category_id",
            "publication_year", "description","available", "shelf", "shelf_id","coverimg","uploaded_files","created_at"]
        
    def get_shelf(self, obj):
        return {
            "id": obj.shelf.id,
            "name": obj.shelf.name,
        }

class WishlistSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_author = serializers.CharField(source="book.author", read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "book", "book_title", "book_author"]

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username', read_only = True)
    class Meta:
        model = Review
        fields = "__all__"