from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CategoryBase(BaseModel):
    name: str
    slug: str


class CategoryOut(CategoryBase):
    id: int


class PortfolioItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    category_id: Optional[int] = None
    is_published: bool = True
    order: int = 0


class PortfolioItemCreate(PortfolioItemBase):
    pass


class PortfolioItemOut(PortfolioItemBase):
    id: int
    created_at: datetime
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True
