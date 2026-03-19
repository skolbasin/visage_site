from app.core.config import settings


def send_email(to: str, subject: str, body: str):
    # Пока просто печатаем в консоль
    print(f"Sending email to {to}: {subject}\n{body}")
    # Здесь будет реальная отправка через SMTP или сторонний сервис
    # Например, используя aiosmtplib или fastapi-mail
    pass


def send_booking_notification(booking_data: dict):
    # Отправка уведомления визажисту
    send_email(
        to=settings.EMAILS_FROM_EMAIL,  # допустим, email мастера
        subject="Новая запись",
        body=f"Новая запись от {booking_data['name']}\nДата: {booking_data['appointment_date']}",
    )
    # Можно также отправить подтверждение клиенту
