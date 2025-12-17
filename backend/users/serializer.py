from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MemberProfile,Penalty

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active"]

class MemberProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MemberProfile
        fields = "__all__"

class PenaltySerializer(serializers.ModelSerializer):
    class Meta:
        model = Penalty
        fields = "__all__"
