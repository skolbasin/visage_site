from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator


class ReviewBase(BaseModel):
    text: str
    rating: int = Field(..., ge=1, le=5)


class ReviewCreate(ReviewBase):
    # Если пользователь авторизован, name может не передаваться, берём из профиля
    name: Optional[str] = None


class ReviewOut(ReviewBase):
    id: int
    user_id: Optional[int]
    name: str  # всегда будет заполнено
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewApprove(BaseModel):
    is_approved: bool
