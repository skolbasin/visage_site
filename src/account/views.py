from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy


class AccountLogin(LoginView):
    template_name = 'accounts/auth_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Вход'
        context['link_list'] = ['server/css/crud.css']

        return context


class AccountLogout(LogoutView):
    next_page = reverse_lazy('main:main')