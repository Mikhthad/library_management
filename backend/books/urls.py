from django.urls import path
from . import views


urlpatterns = [
    path('list/',views.list_book),
    path('add/',views.add_book),
    path('edit/<int:id>/',views.edit_book),
    path('delete/<int:id>/',views.delete_book),
    path('category_list/',views.list_category),
    path('add_category/',views.add_category),
    path('update_category/<int:id>/',views.update_category),
    path('delete_category/<int:id>/',views.delete_category),
    path('search/',views.search_books),
    path('details/<int:id>/',views.book_detail),
    path("wishlist/add/",views.add_wishlist),
    path("wishlist/my/", views.my_wishlist),
    path("wishlist/remove/<int:id>/", views.remove_from_wishlist),
    path("review/add/", views.add_review),
    path("import/", views.book_import),
    path("bulk-upload/", views.bulk_upload_images),
]