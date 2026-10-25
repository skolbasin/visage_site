import enum
from datetime import date, timedelta
from typing import Iterator, Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

SYSTEM_CATEGORY_NAMES = (
    "Продукты",
    "Транспорт",
    "Кафе",
    "Жильё",
    "Коммуналка",
    "Связь",
    "Здоровье",
    "Красота",
    "Подписки",
    "Развлечения",
    "Одежда",
    "Прочее",
)


class ExpensePayer(str, enum.Enum):
    sereja = "sereja"
    nastya = "nastya"


class RecurringInterval(str, enum.Enum):
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


def add_calendar_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    if month <= 0:
        month += 12
        year -= 1
    last_day = _last_day_of_month(year, month)
    return date(year, month, min(value.day, last_day))


def _last_day_of_month(year: int, month: int) -> int:
    if month == 12:
        return 31
    return (date(year, month + 1, 1) - timedelta(days=1)).day


def iter_occurrences(
    start: date,
    interval: RecurringInterval,
    range_from: date,
    range_to: date,
    end_date: Optional[date] = None,
) -> Iterator[date]:
    hard_end = range_to if end_date is None else min(range_to, end_date)
    if start > hard_end:
        return

    step = 0
    while step < 10000:
        if interval == RecurringInterval.weekly:
            current = start + timedelta(days=7 * step)
        elif interval == RecurringInterval.yearly:
            current = add_calendar_months(start, 12 * step)
        else:
            current = add_calendar_months(start, step)
        if current > hard_end:
            return
        if current >= range_from:
            yield current
        step += 1


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False, unique=True)
    is_system = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    expenses = relationship("Expense", back_populates="category")
    recurring = relationship("ExpenseRecurring", back_populates="category")


class ExpenseRecurring(Base):
    __tablename__ = "expense_recurring"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    category_id = Column(
        Integer, ForeignKey("expense_categories.id"), nullable=False, index=True
    )
    paid_by = Column(Enum(ExpensePayer), nullable=False)
    is_shared = Column(Boolean, nullable=False, default=False)
    interval = Column(Enum(RecurringInterval), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("ExpenseCategory", back_populates="recurring")
    expenses = relationship("Expense", back_populates="recurring")


class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = (
        UniqueConstraint(
            "recurring_id", "spent_on", name="uq_expense_recurring_spent_on"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    spent_on = Column(Date, nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category_id = Column(
        Integer, ForeignKey("expense_categories.id"), nullable=False, index=True
    )
    paid_by = Column(Enum(ExpensePayer), nullable=False, index=True)
    is_shared = Column(Boolean, nullable=False, default=False, index=True)
    comment = Column(Text, nullable=True)
    recurring_id = Column(
        Integer, ForeignKey("expense_recurring.id"), nullable=True, index=True
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("ExpenseCategory", back_populates="expenses")
    recurring = relationship("ExpenseRecurring", back_populates="expenses")
