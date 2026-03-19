from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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
