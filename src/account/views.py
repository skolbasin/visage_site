from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy


class AccountLogin(LoginView):
    template_name = 'accounts/auth_page.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class AccountLogout(LogoutView):
    next_page = reverse_lazy('account:login')
