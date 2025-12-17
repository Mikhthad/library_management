from django.urls import path
from . import views

urlpatterns = [
    path("list/", views.list_reservations),
    path("add/", views.add_reservation),
    path("update/<int:id>/", views.update_reservation_status),
    path("user/history/", views.user_reservation_history),
    path('cancel/<int:id>/', views.cancel_reservation),
]
