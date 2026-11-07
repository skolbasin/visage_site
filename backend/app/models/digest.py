from sqlalchemy import Column, Date, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from app.db.base_class import Base


class DigestDispatch(Base):
    """Факт отправки утреннего отчёта: один адресат — один раз в сутки."""

    __tablename__ = "digest_dispatches"
    __table_args__ = (
        UniqueConstraint(
            "sent_on",
            "recipient",
            name="uq_digest_dispatch_day_recipient",
        ),
    )

    id = Column(Integer, primary_key=True)
    sent_on = Column(Date, nullable=False, index=True)
    recipient = Column(String(320), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
