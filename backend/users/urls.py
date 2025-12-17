from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_user),
    path("login/", views.login_user),
    path("logout/", views.logout_user),
    path("me/", views.me),
    path('profile/update/', views.update_profile),
    path('me/update/<int:id>/', views.update_profile),
    path('all/', views.list_all_members),
    path("delete/<int:pk>/", views.delete_member),
    path("monthly-members/", views.monthly_members),
    path("total-members/", views.total_members),
    path("pending/", views.pending_members),
    path('approve/<int:id>/', views.approve_members),
    path("status/<int:id>/", views.toggle_status),
    path("penalties/<int:id>/", views.member_penalties),
]
