from django.urls import path

from main_list.views import main_list_view, hi_view

app_name = "main_list"

urlpatterns = [
    path("", main_list_view, name="main"),
    path("/hi/", hi_view, name='hi'),
]
