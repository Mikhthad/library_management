from django.urls import path
from . import views

urlpatterns = [
    path('issue/',views.issue_book),
    path('member/<int:member_id>/', views.member_active_transactions),
    path('return/<int:id>/',views.return_book),
    path('list/',views.list_transactions),
    path("overdue/", views.overdue_transactions),
    path("daily/", views.dialy_borrow_stats),
    path('fines/',views.list_fines),
    path('fines/update/<int:id>/',views.adjust_fine),
    path('fines/delete/<int:id>/',views.delete_fine),
    path('pay/',views.pay_fine),
    path('user/borrow-history/',views.user_borrow_history),
    path("fines/my/", views.my_fines),
    path("fines/add/", views.add_manual_fine),
]