import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base


class ClientEventType(str, enum.Enum):
    hair = "hair"
    makeup = "makeup"
    look = "look"
    trial_look = "trial_look"
    wedding_look = "wedding_look"
    self_makeup = "self_makeup"
    other = "other"


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    email = Column(String, nullable=True)
    other_contacts = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    events = relationship(
        "ClientEvent",
        back_populates="client",
        cascade="all, delete-orphan",
        order_by="ClientEvent.event_date.desc(), ClientEvent.id.desc()",
    )


class ClientEvent(Base):
    __tablename__ = "client_events"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String, nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    cost = Column(Numeric(10, 2), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    client = relationship("Client", back_populates="events")
