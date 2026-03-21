import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class CertificateType(str, enum.Enum):
    fixed_amount = "fixed_amount"
    specific_service = "specific_service"


class CertificateStatus(str, enum.Enum):
    active = "active"
    used = "used"
    expired = "expired"


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    type = Column(Enum(CertificateType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=True)  # для фиксированной суммы
    service_description = Column(Text, nullable=True)  # для конкретной услуги
    buyer_name = Column(String, nullable=False)
    buyer_email = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    status = Column(Enum(CertificateStatus), default=CertificateStatus.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # срок действия
    used_at = Column(DateTime(timezone=True), nullable=True)

    owner_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # покупатель, если зарегистрирован
    owner = relationship("User", back_populates="certificates")
