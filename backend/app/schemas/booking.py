from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional
from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    name: str
    phone: str
    email: EmailStr
    appointment_date: datetime
    ready_by_date: datetime
    comment: Optional[str] = None
    promo_code: Optional[str] = None  # код строкой

    @validator("ready_by_date")
    def ready_after_appointment(cls, v, values):
        if "appointment_date" in values and v < values["appointment_date"]:
            raise ValueError("ready_by_date must be after appointment_date")
        return v


class BookingCreate(BookingBase):
    pass


class BookingOut(BookingBase):
    id: int
    user_id: Optional[int]
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True
