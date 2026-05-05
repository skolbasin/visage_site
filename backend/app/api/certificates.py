import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_active_user, get_current_admin_user, get_db
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
):
    owner_id = None
    cert = create_certificate(db, cert_data, owner_id)
    return cert


@router.get("/check", response_model=CertificateOut)
def check_certificate(code: str, db: Session = Depends(get_db)):
    """Проверка сертификата по коду (публично)"""
    cert = db.query(Certificate).filter(Certificate.code == code).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Проверка срока действия
    if cert.expires_at and cert.expires_at < datetime.utcnow():
        cert.status = CertificateStatus.expired
        db.commit()

    return cert


# === АДМИНСКИЕ ЭНДПОИНТЫ ===

@router.get("/admin/all", response_model=List[CertificateOut])
def get_all_certificates(
        status: Optional[CertificateStatus] = None,
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Получение всех сертификатов (только администратор)"""
    query = db.query(Certificate)
    if status:
        query = query.filter(Certificate.status == status)
    return query.order_by(Certificate.created_at.desc()).all()


@router.post("/admin/{cert_id}/use", response_model=CertificateOut)
def mark_certificate_used(
        cert_id: int,
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Отметить сертификат как использованный (администратор)"""
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert.status != CertificateStatus.active:
        raise HTTPException(status_code=400, detail="Certificate is not active")

    cert.status = CertificateStatus.used
    cert.used_at = datetime.utcnow()
    db.commit()
    db.refresh(cert)

    logger.info(f"Certificate used: code={cert.code}, id={cert_id}")
    return cert


@router.delete("/admin/{cert_id}")
def delete_certificate(
        cert_id: int,
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Удаление сертификата (администратор)"""
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    db.delete(cert)
    db.commit()

    logger.info(f"Certificate deleted: code={cert.code}, id={cert_id}")
    return {"ok": True}