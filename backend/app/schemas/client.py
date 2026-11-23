from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class ClientEventCreate(BaseModel):
    event_type: str = Field(..., min_length=1, max_length=50)
    event_date: datetime
    cost: Optional[Decimal] = Field(None, ge=0)
    comment: Optional[str] = None


class ClientEventUpdate(BaseModel):
    event_type: Optional[str] = Field(None, min_length=1, max_length=50)
    event_date: Optional[datetime] = None
    cost: Optional[Decimal] = Field(None, ge=0)
    comment: Optional[str] = None


class ClientEventOut(ClientEventCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClientCreate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    phone: Optional[str] = None
    instagram: Optional[str] = None
    email: Optional[str] = None
    other_contacts: Optional[str] = None
    events: List[ClientEventCreate] = Field(default_factory=list)

    @field_validator("name", "phone", "instagram", "email", "other_contacts")
    @classmethod
    def strip_optional_text(cls, value):
        if value is None:
            return None
        value = value.strip()
        return value or None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    phone: Optional[str] = None
    instagram: Optional[str] = None
    email: Optional[str] = None
    other_contacts: Optional[str] = None


class ClientOut(BaseModel):
    id: int
    name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    instagram: Optional[str] = None
    email: Optional[str] = None
    other_contacts: Optional[str] = None
    events: List[ClientEventOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
