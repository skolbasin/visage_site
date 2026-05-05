from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class PromoCodeCreate(BaseModel):
    code: Optional[str] = None  # если не указан - генерируется автоматически
    discount_percent: int


class PromoCodeUpdate(BaseModel):
    code: Optional[str] = None
    discount_percent: Optional[int] = None


class PromoCodeOut(BaseModel):
    id: int
    code: str
    discount_percent: int
    is_used: bool
    owner_id: int
    created_at: datetime
    used_at: Optional[datetime]

    class Config:
        from_attributes = True