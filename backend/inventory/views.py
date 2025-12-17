from django.shortcuts import render,get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from .models import Shelf,BookCopy
from .serializer import BookCopySerializer,ShelfSerializer
from users.permission import isAdmin, IsAdminOrLibrarian
from users.auth import CsrfExemptSessionAuthentication


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def list_copies(request):
    copies = BookCopy.objects.all()
    serializer = BookCopySerializer(copies, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def add_copy(request):
    serializer = BookCopySerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail" : "Copy added","copy":serializer.data},status=200)
    return Response(serializer.errors, status=400)

@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def edit_copy(request, id):
    copy = get_object_or_404(BookCopy, id = id)
    serializer = BookCopySerializer(copy, data = request.data, partial = True)
    if serializer.is_valid():
        serializer.save()
        return Response({"details":"Copy updated", "copy":serializer.data},status=200)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def delete_copy(request, id):
    copy = get_object_or_404(BookCopy, id = id)
    copy.delete()
    return Response({'detail':"Copy deleted"},status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def list_shelves(request):
    shelf = Shelf.objects.all()
    serializer = ShelfSerializer(shelf, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def add_shelves(request):
    serializer = ShelfSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail":"Shelf added", "shelf":serializer.data}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def delete_shelve(request, id):
    shelf = get_object_or_404(Shelf, id = id)
    shelf.delete()
    return Response({'detial':"shelf deleted"},status=200)