from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    contact_type = Column(String(20), nullable=False)  # 'telegram', 'phone', 'email'
    contact_value = Column(String(255), nullable=False)
    status = Column(String(20), default="new", nullable=False)  # new, in_progress, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())