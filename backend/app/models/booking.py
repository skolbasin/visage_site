import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # может быть без регистрации
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    appointment_date = Column(
        DateTime, nullable=False
    )  # дата и время, на которое записывается клиент
    ready_by_date = Column(
        DateTime, nullable=False
    )  # к какому моменту должен быть готов
    comment = Column(Text)
    promo_code_id = Column(Integer, ForeignKey("promo_codes.id"), nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.new)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="bookings")
    promo_code = relationship("PromoCode")
