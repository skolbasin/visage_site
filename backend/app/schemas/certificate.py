from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.certificate import CertificateStatus, CertificateType


class CertificateBase(BaseModel):
    type: CertificateType
    amount: Optional[float] = None
    service_description: Optional[str] = None
    buyer_name: str
    buyer_email: str
    recipient_name: str
    message: Optional[str] = None
    expires_at: Optional[datetime] = None


class CertificateCreate(CertificateBase):
    pass


class CertificateOut(CertificateBase):
    id: int
    code: str
    status: CertificateStatus
    created_at: datetime
    used_at: Optional[datetime]
    owner_id: Optional[int]

    class Config:
        from_attributes = True


class CertificateCheck(BaseModel):
    code: str
