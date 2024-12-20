from django.urls import path

from .views import AccountLogin

app_name = "account"

urlpatterns = [
    path('login/', AccountLogin.as_view(), name='login'),
]
