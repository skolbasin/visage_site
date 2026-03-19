from pydantic import BaseModel
from datetime import datetime


class PromoCodeOut(BaseModel):
    id: int
    code: str
    discount_percent: int
    is_used: bool
    created_at: datetime

    class Config:
        from_attributes = True
