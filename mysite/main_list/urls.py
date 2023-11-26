from django.urls import path

from main_list.views import main_list_view

app_name = "main_list"

urlpatterns = [
    path("", main_list_view, name="main"),
]