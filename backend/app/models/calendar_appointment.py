import enum
from datetime import timedelta
from decimal import Decimal
from typing import Iterable, Optional

from sqlalchemy import (
    Boolean,
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


class CancelReason(str, enum.Enum):
    client_cancelled = "client_cancelled"
    feeling_unwell = "feeling_unwell"
    schedule_conflict = "schedule_conflict"
    force_majeure = "force_majeure"
    other = "other"


class Workplace(str, enum.Enum):
    studio = "studio"
    apartment = "apartment"
    hotel = "hotel"


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


def minutes_for_type(appointment_type: AppointmentType) -> int:
    return int(DURATION_HOURS[appointment_type] * 60)


def resolve_duration_minutes(
    appointment_type: AppointmentType, duration_minutes: Optional[int]
) -> int:
    if duration_minutes is not None and duration_minutes > 0:
        return int(duration_minutes)
    return minutes_for_type(appointment_type)


def duration_for_types(types: Iterable[AppointmentType]) -> timedelta:
    total = timedelta()
    for appointment_type in types:
        total += duration_for_type(appointment_type)
    return total


def money_or_zero(value: Optional[Decimal]) -> Decimal:
    if value is None:
        return Decimal("0")
    return Decimal(value)


class CalendarAppointment(Base):
    __tablename__ = "calendar_appointments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    client_source = Column(Enum(ClientSource), nullable=False)
    client_source_other = Column(String, nullable=True)
    appointment_type = Column(Enum(AppointmentType), nullable=False)
    contact = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=90)
    starts_at = Column(DateTime(timezone=True), nullable=False, index=True)
    ends_at = Column(DateTime(timezone=True), nullable=False, index=True)
    has_prepayment = Column(Boolean, default=False, nullable=False)
    prepayment_amount = Column(Numeric(10, 2), nullable=True)
    workplace = Column(Enum(Workplace), nullable=False)
    comment = Column(Text, nullable=True)
    status = Column(
        Enum(AppointmentStatus),
        default=AppointmentStatus.scheduled,
        nullable=False,
        index=True,
    )
    cancel_reason = Column(Enum(CancelReason), nullable=True)
    cancel_reason_other = Column(String, nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    reschedule_count = Column(Integer, nullable=False, default=0, server_default="0")
    last_reschedule_reason = Column(Text, nullable=True)
    last_rescheduled_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    guests = relationship(
        "AppointmentGuest",
        back_populates="appointment",
        cascade="all, delete-orphan",
        order_by="AppointmentGuest.id",
    )

    @property
    def people_count(self) -> int:
        return 1 + len(self.guests or [])

    @property
    def is_group(self) -> bool:
        return self.people_count > 1

    @property
    def total_price(self) -> Decimal:
        total = money_or_zero(self.price)
        for guest in self.guests or []:
            total += money_or_zero(guest.price)
        return total

    @property
    def total_duration_minutes(self) -> int:
        total = int(self.duration_minutes or 0)
        for guest in self.guests or []:
            total += int(guest.duration_minutes or 0)
        return total


class AppointmentGuest(Base):
    __tablename__ = "calendar_appointment_guests"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(
        Integer,
        ForeignKey("calendar_appointments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False)
    appointment_type = Column(Enum(AppointmentType), nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=90)

    appointment = relationship("CalendarAppointment", back_populates="guests")
