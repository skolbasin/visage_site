from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, model_validator

from app.models.calendar_appointment import (
    AppointmentStatus,
    AppointmentType,
    ClientSource,
    Workplace,
    money_or_zero,
    resolve_duration_minutes,
)


class AppointmentGuestIn(BaseModel):
    name: str = Field(..., min_length=1)
    appointment_type: AppointmentType
    price: Optional[Decimal] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, gt=0)

    @model_validator(mode="after")
    def fill_duration(self):
        self.duration_minutes = resolve_duration_minutes(
            self.appointment_type, self.duration_minutes
        )
        return self


class AppointmentGuestOut(BaseModel):
    id: int
    name: str
    appointment_type: AppointmentType
    price: Optional[Decimal] = None
    duration_minutes: int

    class Config:
        from_attributes = True


class CalendarAppointmentCreate(BaseModel):
    name: str = Field(..., min_length=1)
    client_source: ClientSource
    client_source_other: Optional[str] = None
    appointment_type: AppointmentType
    contact: str = Field(..., min_length=1)
    price: Optional[Decimal] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, gt=0)
    starts_at: datetime
    has_prepayment: bool = False
    prepayment_amount: Optional[Decimal] = Field(None, ge=0)
    workplace: Workplace
    comment: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.scheduled
    guests: List[AppointmentGuestIn] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_prepayment_and_source(self):
        if self.client_source == ClientSource.other:
            if not self.client_source_other or not self.client_source_other.strip():
                raise ValueError("Укажите источник при выборе «другое»")
        else:
            self.client_source_other = None

        self.duration_minutes = resolve_duration_minutes(
            self.appointment_type, self.duration_minutes
        )

        total = money_or_zero(self.price)
        for guest in self.guests:
            if not guest.name.strip():
                raise ValueError("Укажите имя дополнительного клиента")
            total += money_or_zero(guest.price)

        if self.has_prepayment:
            if self.prepayment_amount is None or self.prepayment_amount <= 0:
                raise ValueError("Укажите сумму предоплаты больше 0")
            if total > 0 and self.prepayment_amount > total:
                raise ValueError("Предоплата не может превышать общую стоимость")
        else:
            self.prepayment_amount = None

        return self


class CalendarAppointmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    client_source: Optional[ClientSource] = None
    client_source_other: Optional[str] = None
    appointment_type: Optional[AppointmentType] = None
    contact: Optional[str] = Field(None, min_length=1)
    price: Optional[Decimal] = Field(None, ge=0)
    duration_minutes: Optional[int] = Field(None, gt=0)
    starts_at: Optional[datetime] = None
    has_prepayment: Optional[bool] = None
    prepayment_amount: Optional[Decimal] = Field(None, ge=0)
    workplace: Optional[Workplace] = None
    comment: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    guests: Optional[List[AppointmentGuestIn]] = None


class CalendarAppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class CalendarAppointmentOut(BaseModel):
    id: int
    name: str
    client_source: ClientSource
    client_source_other: Optional[str] = None
    appointment_type: AppointmentType
    contact: str
    price: Optional[Decimal] = None
    duration_minutes: int
    total_duration_minutes: int
    total_price: Decimal
    people_count: int
    is_group: bool
    starts_at: datetime
    ends_at: datetime
    has_prepayment: bool
    prepayment_amount: Optional[Decimal] = None
    workplace: Workplace
    comment: Optional[str] = None
    status: AppointmentStatus
    guests: List[AppointmentGuestOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
