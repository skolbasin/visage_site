import enum
from datetime import timedelta

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from app.db.base_class import Base


class ClientSource(str, enum.Enum):
    instagram = "instagram"
    profi = "profi"
    website = "website"
    referral = "referral"
    returning = "returning"
    other = "other"


class AppointmentType(str, enum.Enum):
    hair = "hair"
    makeup = "makeup"
    look = "look"
    trial_look = "trial_look"
    wedding_look = "wedding_look"
    self_makeup = "self_makeup"


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


DURATION_HOURS = {
    AppointmentType.hair: 1.5,
    AppointmentType.makeup: 1.5,
    AppointmentType.look: 2.5,
    AppointmentType.wedding_look: 2.5,
    AppointmentType.trial_look: 3.0,
    AppointmentType.self_makeup: 3.0,
}


def duration_for_type(appointment_type: AppointmentType) -> timedelta:
    hours = DURATION_HOURS[appointment_type]
    return timedelta(minutes=int(hours * 60))


class CalendarAppointment(Base):
    __tablename__ = "calendar_appointments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    client_source = Column(Enum(ClientSource), nullable=False)
    client_source_other = Column(String, nullable=True)
    appointment_type = Column(Enum(AppointmentType), nullable=False)
    client_link = Column(String, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    starts_at = Column(DateTime(timezone=True), nullable=False, index=True)
    ends_at = Column(DateTime(timezone=True), nullable=False, index=True)
    has_prepayment = Column(Boolean, default=False, nullable=False)
    prepayment_amount = Column(Numeric(10, 2), nullable=True)
    workplace = Column(String, nullable=False)
    comment = Column(Text, nullable=True)
    status = Column(
        Enum(AppointmentStatus),
        default=AppointmentStatus.scheduled,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
