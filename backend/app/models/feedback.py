from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True)
    message = Column(Text)
    contact_type = Column(String)  # 'telegram', 'phone', 'email'
    contact_value = Column(String)
    status = Column(Enum("new", "read", "replied"), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
