from django.contrib.auth import authenticate,login,logout
from django.shortcuts import render,get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.contrib.auth.models import User
from .models import MemberProfile , Penalty
from .serializer import MemberProfileSerializer, PenaltySerializer
from .permission import isAdmin,IsAdminOrLibrarian
from .auth import CsrfExemptSessionAuthentication
from django.utils.timezone import now
from django.db.models import Count



@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    role = request.data.get('role',"member")
    phone = request.data.get('phone')
    address = request.data.get('address')
    plan = request.data.get("membership_plan","basic")

    if not all([username, password, email, phone, address]):
        return Response({"detail": "All fields are required"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return Response({"detail": "username already exists"}, status=400)
    
    user = User.objects.create_user(username=username, password=password, email=email, is_active = False)

    MemberProfile.objects.create(
        user = user,
        role = role,
        phone = phone,
        address = address,
        membership_plan = plan,
        approved = False
    )

    return Response({"detail": "user register successfully"}, status=201)


@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"detail": "Invalid credentials"}, status=400)
    if not user.is_active:
        return Response({"detail":"Account not approved or suspended"}, status=403)

    login(request, user)

    profile = MemberProfile.objects.get(user=user)
    serializer = MemberProfileSerializer(profile)
    return Response({"detail":"Login Successful", "user":serializer.data}, status=200)



@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def logout_user(request):
    print("🔥 LOGOUT VIEW REACHED (NO AUTH.PY)")
    logout(request)
    return Response({"detail": "Logged out successfully"})



@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])   
def me(request):
    try:
        profile = request.user.memberprofile
        serializer = MemberProfileSerializer(profile)
        return Response(serializer.data, status=200)
    except MemberProfile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=404)


@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request, id = None):
    if id is None:
        user = request.user
        profile = user.memberprofile
        is_admin_action = False
    else:
        if not IsAdminOrLibrarian().has_permission(request,None):
            return Response({"detail":"Not allowed admin only."}, status=403)
        profile = get_object_or_404(MemberProfile, id = id)
        user = profile.user
        is_admin_action = True

    user.username = request.data.get("username",user.username)
    user.email = request.data.get("email", user.email)

    new_password = request.data.get('password')
    password_changed = False

    if new_password and new_password.strip() != "":
        user.set_password(new_password)
        password_changed = True

    user.save()
    
    profile.phone = request.data.get('phone',profile.phone)
    profile.address = request.data.get('address',profile.address)

    if is_admin_action:
        profile.role = request.data.get('role',profile.role)
        profile.membership_plan = request.data.get(
            "membership_plan", profile.membership_plan
        )

    profile.save()
    return Response({
        "detail": "Profile updated successfully",
        "password_changed": password_changed,
        "admin_action": is_admin_action
    }, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def list_all_members(request):
    profiles = MemberProfile.objects.select_related('user').all()
    serializer = MemberProfileSerializer(profiles, many = True)
    return Response(serializer.data)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def delete_member(request, pk):
    profile = get_object_or_404(MemberProfile, id = pk)
    profile.user.delete()
    return Response({'detail' : "User deleted"}, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def monthly_members(request):
    today = now().date()
    month_start = today.replace(day=1)

    count = MemberProfile.objects.filter(
        joined_date__date__gte=month_start
    ).count()

    return Response({
        "monthly_new_members": count
    }, status=200)


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def total_members(request):
    count = MemberProfile.objects.all().count()
    return Response({"total members":count})

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def pending_members(request):
    members = MemberProfile.objects.filter(approved = False)
    serializer = MemberProfileSerializer(members, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def approve_members(request, id):
    member = get_object_or_404(MemberProfile, id = id)
    member.approved = True
    member.user.is_active = True
    member.user.save()
    member.save()
    return Response({"detail":"Member approved"},status=201)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def toggle_status(request, id):
    member = get_object_or_404(MemberProfile, id = id)
    member.user.is_active = not member.user.is_active
    member.user.save()
    return Response({"detail":"Status Update"})

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def member_penalties(request, id):
    penalties = Penalty.objects.filter(member_id=id)
    serializer = PenaltySerializer(penalties, many=True)
    return Response(serializer.data)
