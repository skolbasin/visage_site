from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True)
    name = Column(String)  # "Макияж в студии"
    description = Column(Text)
    price = Column(Integer)  # в рублях
    duration = Column(Integer)  # в минутах
    category = Column(String)  # "макияж", "прическа", "обучение"
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)  # для сортировки
