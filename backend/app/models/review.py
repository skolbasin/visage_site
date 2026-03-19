from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # может быть аноним, но лучше привязать
    name = Column(String, nullable=False)  # имя на случай, если не авторизован
    text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    is_approved = Column(Boolean, default=False)  # модерация
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
