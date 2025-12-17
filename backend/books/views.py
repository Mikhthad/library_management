from django.shortcuts import render,get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes,authentication_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from .models import BookModel,Category, Review, Wishlist
from users.permission import IsAdminOrLibrarian
from .serializer import BookModelSerializer,CategorySerializer,ReviewSerializer, WishlistSerializer
from .auth import CsrfExemptSessionAuthentication
from .utils_import import import_books_from_file
from django.db.models import Count,Q
from inventory.models import Shelf

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
def list_category(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAdminOrLibrarian,IsAuthenticated])
def add_category(request):
    serializer = CategorySerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail":"Category Added","data":serializer.data}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['PUT'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def update_category(request, id):
    category = get_object_or_404(Category, id = id)
    serializer = CategorySerializer(category, data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail":"Category updated","data":serializer.data},status=201)
    return Response(serializer.errors, status=400)

@api_view(["DELETE"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated,IsAdminOrLibrarian])
def delete_category(request, id):
    category = get_object_or_404(Category, id = id)
    category.delete()
    return Response({"detail":"Category deleted"},status=200)


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
def list_book(request):
    books = BookModel.objects.all()
    serializer = BookModelSerializer(books, many = True)
    return Response(serializer.data, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def add_book(request):
    serializer = BookModelSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail":"Book added", "book":serializer.data}, status=201)
    return Response(serializer.errors, status=400)

@api_view(["PUT"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def edit_book(request, id):
    book = get_object_or_404(BookModel, id = id)
    serializer = BookModelSerializer(book,data = request.data, partial = True)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail" : "Book update succefully", "book":serializer.data}, status=200)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def delete_book(request, id):
    book = get_object_or_404(BookModel, id = id)
    book.delete()
    return Response({"detail" : 'Book deleted'}, status=200)

@api_view(['POST'])
@parser_classes([MultiPartParser])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def book_import(request):
    file = request.FILES.get('file')
    if not file:
        return Response({"error":"No file provided"}, status=400)
    ok, msg = import_books_from_file(file)
    if ok:
        return Response({"message":msg},status=200)
    return Response({"error":msg}, status=400)

@api_view(['POST'])
@parser_classes([MultiPartParser])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def bulk_upload_images(request):
    files = request.FILES.getlist("images")
    if not files:
        return Response({"error":"No images uploaded"}, status=400)
    default_shelf = Shelf.objects.first()

    for image in files:
        BookModel.objects.create(
            title=f"Bulk-{image.name}",
            author="Unknown",
            isbn=f"IMG-{image.size}", 
            shelf=default_shelf,
            cover=image,
        )
    return Response({"message": "Bulk images uploaded"})


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
def search_books(request):
    books = BookModel.objects.all()

    q = request.GET.get('q')
    author = request.GET.get('author')
    year = request.GET.get('year')
    category = request.GET.get('category')
    available = request.GET.get('available')

    if q:
        books = books.filter(
            Q(title__icontains=q) |
            Q(isbn__icontains=q)
        )

    if author:
        books = books.filter(author__icontains=author)

    if year:
        books = books.filter(publication_year=year)

    if category:
        books = books.filter(category_id=category)

    if available == "true":
        books = books.filter(available=True)

    serializer = BookModelSerializer(books, many=True)
    return Response(serializer.data, status=200)


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
def book_detail(request, id):
    book = get_object_or_404(BookModel, id=id)
    reviews = Review.objects.filter(book=book)
    related = BookModel.objects.filter(category=book.category).exclude(id=id)

    return Response({
        "book": BookModelSerializer(book).data,
        "reviews": ReviewSerializer(reviews, many=True).data,
        "related": BookModelSerializer(related, many=True).data
    })



@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def add_wishlist(request):
    book_id = request.data.get("book")
    if not book_id:
        return Response({"detail": "Book ID required"}, status=400)

    Wishlist.objects.create(
        user=request.user,
        book_id=book_id
    )
    return Response({"detail": "Added to wishlist"})

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def my_wishlist(request):
    wishlist = Wishlist.objects.filter(user = request.user)
    serializer = WishlistSerializer(wishlist, many = True)
    return Response(serializer.data, status=200)

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, id):
    wishlist = get_object_or_404(Wishlist, id = id, user = request.user)
    wishlist.delete()
    return Response({"detail":"Removed from wishlist"}, status=200)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
def add_review(request):
    serializer = ReviewSerializer(data = request.data)
    if serializer.is_valid():
        serializer.save(user = request.user)
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)