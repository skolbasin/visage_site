from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.models.calendar_appointment import (
    AppointmentStatus,
    AppointmentType,
    ClientSource,
)


class CalendarAppointmentCreate(BaseModel):
    name: str = Field(..., min_length=1)
    client_source: ClientSource
    client_source_other: Optional[str] = None
    appointment_type: AppointmentType
    client_link: Optional[str] = None
    price: Decimal = Field(..., ge=0)
    starts_at: datetime
    has_prepayment: bool = False
    prepayment_amount: Optional[Decimal] = Field(None, ge=0)
    workplace: str = Field(..., min_length=1)
    comment: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.scheduled

    @model_validator(mode="after")
    def validate_prepayment_and_source(self):
        if self.has_prepayment:
            if self.prepayment_amount is None or self.prepayment_amount <= 0:
                raise ValueError("Укажите сумму предоплаты больше 0")
            if self.prepayment_amount > self.price:
                raise ValueError("Предоплата не может превышать стоимость")
        else:
            self.prepayment_amount = None

        if self.client_source == ClientSource.other:
            if not self.client_source_other or not self.client_source_other.strip():
                raise ValueError("Укажите источник при выборе «другое»")
        else:
            self.client_source_other = None

        return self


class CalendarAppointmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    client_source: Optional[ClientSource] = None
    client_source_other: Optional[str] = None
    appointment_type: Optional[AppointmentType] = None
    client_link: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    starts_at: Optional[datetime] = None
    has_prepayment: Optional[bool] = None
    prepayment_amount: Optional[Decimal] = Field(None, ge=0)
    workplace: Optional[str] = Field(None, min_length=1)
    comment: Optional[str] = None
    status: Optional[AppointmentStatus] = None


class CalendarAppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class CalendarAppointmentOut(BaseModel):
    id: int
    name: str
    client_source: ClientSource
    client_source_other: Optional[str] = None
    appointment_type: AppointmentType
    client_link: Optional[str] = None
    price: Decimal
    starts_at: datetime
    ends_at: datetime
    has_prepayment: bool
    prepayment_amount: Optional[Decimal] = None
    workplace: str
    comment: Optional[str] = None
    status: AppointmentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
