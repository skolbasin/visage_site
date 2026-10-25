from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.expense import ExpensePayer, RecurringInterval


class ExpenseCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)


class ExpenseCategoryOut(BaseModel):
    id: int
    name: str
    is_system: bool

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    spent_on: date
    amount: Decimal = Field(..., gt=0)
    category_id: int
    paid_by: ExpensePayer
    is_shared: bool = False
    comment: Optional[str] = None


class ExpenseUpdate(BaseModel):
    spent_on: Optional[date] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    category_id: Optional[int] = None
    paid_by: Optional[ExpensePayer] = None
    is_shared: Optional[bool] = None
    comment: Optional[str] = None


class ExpenseOut(BaseModel):
    id: int
    spent_on: date
    amount: Decimal
    category_id: int
    category_name: str
    paid_by: ExpensePayer
    is_shared: bool
    comment: Optional[str] = None
    recurring_id: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CategoryBreakdown(BaseModel):
    id: int
    name: str
    total: Decimal
    count: int


class ExpenseSummary(BaseModel):
    total: Decimal
    shared: Decimal
    personal: Decimal
    personal_sereja: Decimal
    personal_nastya: Decimal
    paid_sereja: Decimal
    paid_nastya: Decimal
    by_category: List[CategoryBreakdown]


class ExpenseListOut(BaseModel):
    items: List[ExpenseOut]
    summary: ExpenseSummary


class RecurringCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=160)
    amount: Decimal = Field(..., gt=0)
    category_id: int
    paid_by: ExpensePayer
    is_shared: bool = False
    interval: RecurringInterval
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True


class RecurringUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=160)
    amount: Optional[Decimal] = Field(None, gt=0)
    category_id: Optional[int] = None
    paid_by: Optional[ExpensePayer] = None
    is_shared: Optional[bool] = None
    interval: Optional[RecurringInterval] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class RecurringOut(BaseModel):
    id: int
    title: str
    amount: Decimal
    category_id: int
    category_name: str
    paid_by: ExpensePayer
    is_shared: bool
    interval: RecurringInterval
    start_date: date
    end_date: Optional[date] = None
    is_active: bool

    class Config:
        from_attributes = True
