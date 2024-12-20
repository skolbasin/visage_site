from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxValueValidator


class EveryDay(models.Model):
    date = models.DateField(verbose_name=_('date'), unique=True)
    post = models.PositiveIntegerField(verbose_name=_('post'), validators=[MaxValueValidator(999)])
    reels = models.PositiveIntegerField(verbose_name=_('reels'), validators=[MaxValueValidator(999)])
    photoshoot = models.PositiveIntegerField(verbose_name=_('photoshoot'), validators=[MaxValueValidator(999)])
    work = models.PositiveIntegerField(verbose_name=_('work'), validators=[MaxValueValidator(999)])
    wrote_to_me = models.PositiveIntegerField(verbose_name=_('wrote to me'), validators=[MaxValueValidator(999)])
    followers = models.PositiveIntegerField(verbose_name=_('followers'), validators=[MaxValueValidator(999)])
    subscribed = models.PositiveIntegerField(verbose_name=_('subscribed'), validators=[MaxValueValidator(999)])
    training = models.PositiveIntegerField(verbose_name=_('training'), validators=[MaxValueValidator(999)])

    def __str__(self):
        return f'EveryDay Entry: {self.date}'

    class Meta:
        verbose_name = _('EveryDay Entry')
        verbose_name_plural = _('EveryDay Entry')
