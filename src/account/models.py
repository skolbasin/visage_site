from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(email, password, **extra_fields)
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

    # 2 поля и 2 метода нужны, чтоб корректно работал кастомный класс.
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['code_word']  # только для суперпользователя
