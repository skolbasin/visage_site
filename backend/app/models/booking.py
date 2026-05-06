import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class BookingStatus(str, enum.Enum):
    new = "new"
    in_progress = "in_progress"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    service_name = Column(String, nullable=True)
    appointment_date = Column(DateTime, nullable=False)
    ready_by_date = Column(DateTime, nullable=False)
    comment = Column(Text, nullable=True)
    promo_code_id = Column(Integer, ForeignKey("promo_codes.id"), nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.new)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    promo_code = relationship("PromoCode", back_populates="bookings")