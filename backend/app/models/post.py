from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class PostType(str, enum.Enum):
    photo = "photo"
    video = "video"
    text = "text"


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(PostType), default=PostType.photo)
    media_url = Column(String, nullable=True)  # для фото/видео
    content = Column(Text, nullable=True)  # текст поста
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
