from django.urls import path
from . import views

urlpatterns = [
    path("my/", views.my_notifications),
    path("read/<int:id>/", views.mark_read),
    path("send/", views.create_notification),
]