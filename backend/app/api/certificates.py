import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_active_user,
    get_current_admin_user,
    get_db,
)
from app.models.certificate import Certificate, CertificateStatus
from app.models.user import User
from app.schemas.certificate import CertificateCheck, CertificateCreate, CertificateOut
from app.services.certificate_service import create_certificate

router = APIRouter(prefix="/certificates", tags=["certificates"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=CertificateOut)
def purchase_certificate(
    cert_data: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    """Покупка сертификата (доступно всем, но авторизованным привязывается к аккаунту)"""
    owner_id = current_user.id if current_user else None
    cert = create_certificate(db, cert_data, owner_id)

    # Отправка email с сертификатом
    # send_certificate_email(cert)
    logger.info(
        f"Certificate purchased: code={cert.code}, buyer={cert.buyer_email}, recipient={cert.recipient_name}"
    )

    return cert


@router.get("/check", response_model=CertificateOut)
def check_certificate(code: str, db: Session = Depends(get_db)):
    """Проверка сертификата (публично)"""
    cert = db.query(Certificate).filter(Certificate.code == code).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert


# Админские эндпоинты
@router.get(
    "/admin/all",
    response_model=List[CertificateOut],
    dependencies=[Depends(get_current_admin_user)],
)
def get_all_certificates(
    status: Optional[CertificateStatus] = None, db: Session = Depends(get_db)
):
    query = db.query(Certificate)
    if status:
        query = query.filter(Certificate.status == status)
    return query.all()


@router.post(
    "/admin/{cert_id}/use",
    response_model=CertificateOut,
    dependencies=[Depends(get_current_admin_user)],
)
def mark_certificate_used(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if cert.status != CertificateStatus.active:
        raise HTTPException(status_code=400, detail="Certificate is not active")
    cert.status = CertificateStatus.used
    cert.used_at = datetime.utcnow()
    db.commit()
    db.refresh(cert)

    return cert
