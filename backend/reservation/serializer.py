from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source = 'member.user.username', read_only = True)
    book_title = serializers.CharField(source = 'book.title', read_only = True)
    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ["status", "created_at"]