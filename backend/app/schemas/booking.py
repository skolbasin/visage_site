from datetime import datetime
import re
import unicodedata
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

    @validator("name")
    def validate_name(cls, value):
        name = value.strip()
        if not 2 <= len(name) <= 100:
            raise ValueError("Имя должно содержать от 2 до 100 букв")

        letter_count = 0
        separators = {" ", ".", "'", "\u2019", "-"}
        for index, character in enumerate(name):
            category = unicodedata.category(character)
            if category.startswith("L"):
                letter_count += 1
                continue
            if category.startswith("M"):
                if index == 0 or not unicodedata.category(name[index - 1]).startswith(
                    ("L", "M")
                ):
                    raise ValueError("Укажите имя буквами")
                continue
            if (
                character not in separators
                or index == 0
                or index == len(name) - 1
                or not unicodedata.category(name[index - 1]).startswith(("L", "M"))
                or not unicodedata.category(name[index + 1]).startswith("L")
            ):
                raise ValueError(
                    "Имя может содержать буквы, пробелы, дефис или апостроф"
                )

        if letter_count < 2:
            raise ValueError("Имя должно содержать не менее двух букв")
        return name

    @validator("phone")
    def validate_phone(cls, value):
        phone = value.strip()
        digits = re.sub(r"\D", "", phone)
        if (
            not re.fullmatch(r"[+()\d\s.-]+", phone)
            or not 7 <= len(digits) <= 15
        ):
            raise ValueError("Введите корректный номер телефона")
        if re.search(r"(\d)\1{6,}", digits):
            raise ValueError(
                "Номер похож на фиктивный: слишком много одинаковых цифр подряд"
            )
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
