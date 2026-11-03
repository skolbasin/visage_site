from datetime import date, timedelta
from typing import List

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

TOP5_MIN_TASKS = 2
TOP5_MAX_TASKS = 5
TOP5_WEEKDAY_MIN = 0
TOP5_WEEKDAY_MAX = 4


def monday_of(value: date) -> date:
    return value - timedelta(days=value.weekday())


def friday_of(week_start: date) -> date:
    return week_start + timedelta(days=TOP5_WEEKDAY_MAX)


class MarketingTop5Week(Base):
    __tablename__ = "marketing_top5_weeks"

    id = Column(Integer, primary_key=True, index=True)
    week_start = Column(Date, nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tasks = relationship(
        "MarketingTop5Task",
        back_populates="week",
        cascade="all, delete-orphan",
        order_by="MarketingTop5Task.position",
    )


class MarketingTop5Task(Base):
    __tablename__ = "marketing_top5_tasks"
    __table_args__ = (
        CheckConstraint("position >= 1", name="ck_marketing_top5_position"),
        CheckConstraint(
            "weekday IS NULL OR (weekday >= 0 AND weekday <= 4)",
            name="ck_marketing_top5_weekday",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(
        Integer,
        ForeignKey("marketing_top5_weeks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    position = Column(Integer, nullable=False)
    title = Column(String(300), nullable=False)
    owner = Column(String(80), nullable=True)
    weekday = Column(Integer, nullable=True)
    is_done = Column(Boolean, nullable=False, default=False)
    done_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    week = relationship("MarketingTop5Week", back_populates="tasks")


QUARTER_MAX_TASKS = 40
QUARTER_SOFT_MAX = 30
QUARTER_MONTHS = 3
DEFAULT_QUARTER_BLOCKS = (
    "Интернет",
    "Привлечение клиентов",
    "Удержание клиентов",
    "Аналитика",
    "PR",
)


def _last_day(year: int, month: int) -> int:
    if month == 12:
        return 31
    return (date(year, month + 1, 1) - timedelta(days=1)).day


def add_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    if month <= 0:
        month += 12
        year -= 1
    return date(year, month, min(value.day, _last_day(year, month)))


def quarter_start_of(value: date) -> date:
    month = ((value.month - 1) // 3) * 3 + 1
    return date(value.year, month, 1)


def quarter_end_of(starts_on: date) -> date:
    return add_months(starts_on, QUARTER_MONTHS) - timedelta(days=1)


def quarter_months(starts_on: date) -> List[date]:
    return [add_months(starts_on, offset) for offset in range(QUARTER_MONTHS)]


class MarketingQuarter(Base):
    __tablename__ = "marketing_quarters"

    id = Column(Integer, primary_key=True, index=True)
    starts_on = Column(Date, nullable=False, unique=True, index=True)
    retrospective = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    blocks = relationship(
        "MarketingQuarterBlock",
        back_populates="quarter",
        cascade="all, delete-orphan",
        order_by="MarketingQuarterBlock.position",
    )
    reviews = relationship(
        "MarketingQuarterReview",
        back_populates="quarter",
        cascade="all, delete-orphan",
    )


class MarketingQuarterBlock(Base):
    __tablename__ = "marketing_quarter_blocks"
    __table_args__ = (
        CheckConstraint("position >= 1", name="ck_marketing_quarter_block_position"),
    )

    id = Column(Integer, primary_key=True, index=True)
    quarter_id = Column(
        Integer,
        ForeignKey("marketing_quarters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(80), nullable=False)
    position = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    quarter = relationship("MarketingQuarter", back_populates="blocks")
    tasks = relationship(
        "MarketingQuarterTask",
        back_populates="block",
        cascade="all, delete-orphan",
        order_by="MarketingQuarterTask.position",
    )


class MarketingQuarterTask(Base):
    __tablename__ = "marketing_quarter_tasks"
    __table_args__ = (
        CheckConstraint("position >= 1", name="ck_marketing_quarter_task_position"),
    )

    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(
        Integer,
        ForeignKey("marketing_quarter_blocks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    position = Column(Integer, nullable=False)
    title = Column(String(300), nullable=False)
    is_done = Column(Boolean, nullable=False, default=False)
    done_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    block = relationship("MarketingQuarterBlock", back_populates="tasks")


class MarketingQuarterReview(Base):
    __tablename__ = "marketing_quarter_reviews"
    __table_args__ = (
        UniqueConstraint(
            "quarter_id",
            "month_index",
            name="uq_marketing_quarter_review_month",
        ),
        CheckConstraint(
            "month_index >= 1 AND month_index <= 3",
            name="ck_marketing_quarter_review_month",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    quarter_id = Column(
        Integer,
        ForeignKey("marketing_quarters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    month_index = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    quarter = relationship("MarketingQuarter", back_populates="reviews")
