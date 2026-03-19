import random
import string

from app.models.certificate import Certificate, CertificateStatus


def generate_certificate_code() -> str:
    """Генерирует уникальный код сертификата"""
    return "CERT-" + "".join(
        random.choices(string.ascii_uppercase + string.digits, k=10)
    )


def create_certificate(db, data, owner_id=None):
    code = generate_certificate_code()
    # Проверка уникальности (можно цикл, но вероятность коллизии мала)
    while db.query(Certificate).filter(Certificate.code == code).first():
        code = generate_certificate_code()
    cert = Certificate(
        code=code,
        type=data.type,
        amount=data.amount,
        service_description=data.service_description,
        buyer_name=data.buyer_name,
        buyer_email=data.buyer_email,
        recipient_name=data.recipient_name,
        message=data.message,
        expires_at=data.expires_at,
        owner_id=owner_id,
        status=CertificateStatus.active,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert
