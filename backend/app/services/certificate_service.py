import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.certificate import Certificate, CertificateStatus
from app.schemas.certificate import CertificateCreate


def generate_certificate_code():
    """Генерация уникального кода сертификата"""
    return 'GIFT-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))


def create_certificate(db: Session, cert_data: CertificateCreate, owner_id: int = None) -> Certificate:
    """Создание нового сертификата"""
    code = generate_certificate_code()

    # Срок действия: 6 месяцев
    expires_at = datetime.utcnow() + timedelta(days=180)

    certificate = Certificate(
        code=code,
        type=cert_data.type,
        amount=cert_data.amount,
        service_description=cert_data.service_description,
        buyer_name=cert_data.buyer_name,
        buyer_email=cert_data.buyer_email,
        recipient_name=cert_data.recipient_name,
        message=cert_data.message,
        expires_at=expires_at,
        owner_id=owner_id,
        status=CertificateStatus.active
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return certificate