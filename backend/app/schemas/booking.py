from datetime import datetime
import re
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, validator

from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    name: str
    phone: str
    email: EmailStr
    service_name: Optional[str] = None
    appointment_date: datetime
    ready_by_date: datetime
    comment: Optional[str] = None
    promo_code: Optional[str] = None

    @validator("ready_by_date")
    def ready_after_appointment(cls, v, values):
        if "appointment_date" in values and v < values["appointment_date"]:
            raise ValueError("ready_by_date must be after appointment_date")
        return v


class BookingCreate(BookingBase):
    website: str = Field(default="", max_length=255)

    @validator("phone")
    def validate_phone(cls, value):
        phone = value.strip()
        digits = re.sub(r"\D", "", phone)
        if (
            not re.fullmatch(r"[+()\d\s.-]+", phone)
            or not 7 <= len(digits) <= 15
        ):
            raise ValueError("Введите корректный номер телефона")
        return phone


class BookingOut(BookingBase):
    id: int
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True


class BookingUpdateStatus(BaseModel):
    status: BookingStatus


class BookingAdminOut(BookingOut):
    promo_code_id: Optional[int]
    # можно добавить информацию о пользователе
