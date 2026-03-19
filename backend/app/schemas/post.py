from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.post import PostType


class PostBase(BaseModel):
    type: PostType = PostType.photo
    media_url: Optional[str] = None
    content: Optional[str] = None
    is_published: bool = True


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    type: Optional[PostType] = None
    media_url: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None


class PostOut(PostBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
