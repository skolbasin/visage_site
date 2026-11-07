import logging
from pathlib import Path
from typing import Mapping, Optional, Sequence

import resend
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings
from app.services.admin_recipients import notification_emails

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY

TEMPLATES_DIR = Path(__file__).parent / "templates"

env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_template(template_name: str, **kwargs: object) -> str:
    """Рендеринг HTML-шаблона."""
    template = env.get_template(template_name)
    return template.render(**kwargs)


def _deliver(
    subject: str,
    html: str,
    recipients: Optional[Sequence[str]] = None,
    kind: str = "email",
) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("письмо %s не отправлено: нет RESEND_API_KEY", kind)
        return False
    resend.api_key = settings.RESEND_API_KEY
    if recipients is None:
        to = notification_emails()
    else:
        to = [item.strip() for item in recipients if item and item.strip()]
    if not to:
        logger.warning("письмо %s не отправлено: нет адресатов", kind)
        return False
    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM,
                "to": to,
                "subject": subject,
                "html": html,
            }
        )
    except Exception:
        logger.exception("письмо %s не отправлено: ошибка Resend", kind)
        return False
    logger.info("письмо %s отправлено, адресатов: %s", kind, len(to))
    return True


def send_booking_notification(booking_data: Mapping[str, object]) -> bool:
    """Уведомление о новой записи — обоим администраторам."""
    subject = "📅 Новая запись от {name}".format(name=booking_data.get("name") or "")
    html = render_template(
        "booking_email.html",
        greeting="Здравствуйте!",
        name=booking_data.get("name"),
        phone=booking_data.get("phone"),
        email=booking_data.get("email"),
        service=booking_data.get("service"),
        appointment_date=booking_data.get("appointment_date"),
        promo_code=booking_data.get("promo_code"),
        comment=booking_data.get("comment"),
        status=booking_data.get("status", "new"),
        admin_link="{site}/admin/bookings".format(site=settings.SITE_URL.rstrip("/")),
    )
    return _deliver(subject, html, kind="booking")


def send_certificate_notification(certificate_data: Mapping[str, object]) -> bool:
    """Уведомление о новом сертификате — обоим администраторам."""
    subject = "🎁 Новый сертификат от {name}".format(
        name=certificate_data.get("buyer_name") or ""
    )
    html = render_template(
        "certificate_email.html",
        greeting="Здравствуйте!",
        buyer_name=certificate_data.get("buyer_name"),
        buyer_email=certificate_data.get("buyer_email"),
        recipient_name=certificate_data.get("recipient_name"),
        certificate_type=certificate_data.get("type"),
        amount=certificate_data.get("amount"),
        service_description=certificate_data.get("service_description"),
        certificate_code=certificate_data.get("code"),
        message=certificate_data.get("message"),
        status=certificate_data.get("status", "active"),
        admin_link="{site}/admin/certificates".format(site=settings.SITE_URL.rstrip("/")),
    )
    return _deliver(subject, html, kind="certificate")


def send_question_notification(question_data: Mapping[str, object]) -> bool:
    """Уведомление о новом вопросе — обоим администраторам."""
    subject = "💬 Новый вопрос от клиента"
    html = render_template(
        "question_email.html",
        greeting="Здравствуйте!",
        name=question_data.get("name"),
        contact_type=question_data.get("contact_type"),
        contact_value=question_data.get("contact_value"),
        message=question_data.get("message"),
        status=question_data.get("status", "new"),
        admin_link="{site}/admin/questions".format(site=settings.SITE_URL.rstrip("/")),
    )
    return _deliver(subject, html, kind="question")


def send_digest_email(
    to: str,
    name: str,
    report_date: str,
    sections: Sequence[object],
) -> bool:
    """Одно письмо с недочётами конкретного администратора."""
    subject = "Утренний отчёт за {day}".format(day=report_date)
    html = render_template(
        "digest_email.html",
        name=name,
        report_date=report_date,
        sections=sections,
    )
    return _deliver(subject, html, recipients=[to], kind="digest")


def send_test_email() -> bool:
    """Тестовая отправка на всех администраторов."""
    html = "<h1>Тест</h1><p>Если вы видите это письмо — Resend работает.</p>"
    return _deliver("🔧 Тестовое письмо", html, kind="test")
