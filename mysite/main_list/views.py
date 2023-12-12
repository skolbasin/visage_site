from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def main_list_view(request: HttpRequest) -> HttpResponse:
    return render(request, "main_list/landing.html", )
