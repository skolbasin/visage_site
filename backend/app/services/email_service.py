import resend
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.core.config import settings

# Инициализация Resend
resend.api_key = settings.RESEND_API_KEY

# Путь к шаблонам
TEMPLATES_DIR = Path(__file__).parent / "templates"


# Настройка Jinja2 окружения
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)


def render_template(template_name: str, **kwargs) -> str:
    """Рендеринг HTML-шаблона"""
    template = env.get_template(template_name)
    return template.render(**kwargs)


def send_booking_notification(booking_data: dict) -> bool:
    """Отправка уведомления о новой записи"""
    if not settings.RESEND_API_KEY:
        print("⚠️ Resend не настроен. Письмо не отправлено.")
        return False

    subject = f"📅 Новая запись от {booking_data.get('name')}"

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
        admin_link=f"{settings.SITE_URL}/admin/bookings",
    )

    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM,
                "to": settings.ADMIN_EMAIL,
                "subject": subject,
                "html": html,
            }
        )
        print(f"✅ Письмо о записи отправлено на {settings.ADMIN_EMAIL}")
        return True
    except Exception as e:
        print(f"❌ Ошибка отправки письма: {e}")
        return False


def send_certificate_notification(certificate_data: dict) -> bool:
    """Отправка уведомления о новом сертификате"""
    if not settings.RESEND_API_KEY:
        print("⚠️ Resend не настроен. Письмо не отправлено.")
        return False

    subject = f"🎁 Новый сертификат от {certificate_data.get('buyer_name')}"

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
        admin_link=f"{settings.SITE_URL}/admin/certificates",
    )

    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM,
                "to": settings.ADMIN_EMAIL,
                "subject": subject,
                "html": html,
            }
        )
        print(f"✅ Письмо о сертификате отправлено на {settings.ADMIN_EMAIL}")
        return True
    except Exception as e:
        print(f"❌ Ошибка отправки письма: {e}")
        return False


def send_question_notification(question_data: dict) -> bool:
    """Отправка уведомления о новом вопросе"""
    if not settings.RESEND_API_KEY:
        print("⚠️ Resend не настроен. Письмо не отправлено.")
        return False

    subject = f"💬 Новый вопрос от клиента"

    html = render_template(
        "question_email.html",
        greeting="Здравствуйте!",
        name=question_data.get("name"),
        contact_type=question_data.get("contact_type"),
        contact_value=question_data.get("contact_value"),
        message=question_data.get("message"),
        status=question_data.get("status", "new"),
        admin_link=f"{settings.SITE_URL}/admin/questions",
    )

    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM,
                "to": settings.ADMIN_EMAIL,
                "subject": subject,
                "html": html,
            }
        )
        print(f"✅ Письмо о вопросе отправлено на {settings.ADMIN_EMAIL}")
        return True
    except Exception as e:
        print(f"❌ Ошибка отправки письма: {e}")
        return False


def send_test_email() -> bool:
    """Тестовая отправка письма"""
    if not settings.RESEND_API_KEY:
        print("⚠️ Resend не настроен")
        return False

    try:
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM,
                "to": [settings.ADMIN_EMAIL],
                "subject": "🔧 Тестовое письмо",
                "html": "<h1>Тест!</h1><p>Если вы видите это письмо — Resend работает!</p>",
            }
        )
        print(f"✅ Тестовое письмо отправлено на {settings.ADMIN_EMAIL}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
