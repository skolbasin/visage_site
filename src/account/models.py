from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, email, code_word):
        if not email:
            raise ValueError('А ну-ка введите пароль"')
        email = self.normalize_email(email)
        user = self.model(email=email, code_word=code_word)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, code_word):
        user = self.create_user(email, code_word)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser):
    """Кастомная модель пользователя"""
    email = models.EmailField(
        verbose_name=_('email address'),
        max_length=255,
        unique=True,
    )

    code_word = models.CharField(
        max_length=128,
        verbose_name=_('code_word'),
        null=False,
        blank=False,
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['code_word']  # только для суперпользователя
