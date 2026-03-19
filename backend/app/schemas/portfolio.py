from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.category import CategoryBase, CategoryOut


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


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None


class PortfolioItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    is_published: Optional[bool] = None
    order: Optional[int] = None
