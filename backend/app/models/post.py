import enum
from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.sql import func
from app.db.base_class import Base


class PostType(str, enum.Enum):
    photo = "photo"
    video = "video"
    text = "text"


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(PostType), default=PostType.photo)
    media_url = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
