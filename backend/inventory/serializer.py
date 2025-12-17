from rest_framework import serializers
from .models import Shelf,BookCopy
from books.serializer import BookModelSerializer
from books.models import BookModel

class ShelfSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shelf
        fields = "__all__"

class BookCopySerializer(serializers.ModelSerializer):
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=BookModel.objects.all(),
        source="book",
        write_only=True
    )
    shelf_id = serializers.PrimaryKeyRelatedField(
        queryset=Shelf.objects.all(),
        source="shelf",
        write_only=True
    )

    book = serializers.SerializerMethodField()
    shelf = serializers.SerializerMethodField()

    class Meta:
        model = BookCopy
        fields = [
            "id",
            "book", "book_id",
            "shelf", "shelf_id",
            "copy_number",
            "status"
        ]

    def get_book(self, obj):
        return {
            "id": obj.book.id,
            "title": obj.book.title
        }

    def get_shelf(self, obj):
        return {
            "id": obj.shelf.id,
            "name": obj.shelf.name
        }