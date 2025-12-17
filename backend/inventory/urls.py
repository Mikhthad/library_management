from django.urls import path
from . import views

urlpatterns = [
    path('copies/', views.list_copies),
    path('copies/add/',views.add_copy),
    path('copies/edit/<int:id>/', views.edit_copy),
    path('copies/delete/<int:id>/', views.delete_copy),
    path('shelves/',views.list_shelves),
    path('shelves/add/',views.add_shelves),
    path('shelve/delete/<int:id>/',views.delete_shelve),
]