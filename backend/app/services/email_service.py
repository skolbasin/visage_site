from fastapi_mail import ConnectionConfig, FastMail, MessageSchema

from app.core.config import settings

if settings.SMTP_HOST and settings.SMTP_PORT and settings.EMAILS_FROM_EMAIL:
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.EMAILS_FROM_EMAIL,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_SERVER=settings.SMTP_HOST,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )
else:
    conf = None  # или просто не используем email


async def send_booking_notification(booking):
    message = MessageSchema(
        subject="Новая запись",
        recipients=[settings.EMAILS_FROM_EMAIL],  # мастеру
        body=f"Новая запись от {booking.name}\nДата: {booking.appointment_date}",
        subtype="plain",
    )
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_certificate_email(certificate):
    # Формируем письмо с кодом сертификата
    body = f"Ваш подарочный сертификат: {certificate.code}\n"
    body += f"Для {certificate.recipient_name} от {certificate.buyer_name}"
    message = MessageSchema(
        subject="Подарочный сертификат",
        recipients=[certificate.buyer_email],
        body=body,
        subtype="plain",
    )
    fm = FastMail(conf)
    await fm.send_message(message)
