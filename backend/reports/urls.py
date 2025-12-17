from django.urls import path
from . import views

urlpatterns = [
    path('daily/',views.dialy_report),
    path('monthly/', views.monthly_report),
    path('popular-books/', views.book_popularity_report),
    path('active-members/', views.active_member_report),
    path('list/', views.list_reports),
    path('export/csv/<int:id>/', views.export_csv),
    path('delete/<int:id>/', views.delete_report), 
]