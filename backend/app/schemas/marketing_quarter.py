from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.marketing import QUARTER_MAX_TASKS, QUARTER_MONTHS


class QuarterCreate(BaseModel):
    on: date


class QuarterBlockCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    on: date
    title: str = Field(..., min_length=1, max_length=80)


class QuarterBlockUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(None, min_length=1, max_length=80)
    position: Optional[int] = Field(None, ge=1)


class QuarterTaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    block_id: int
    title: str = Field(..., min_length=1, max_length=300)


class QuarterTaskUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(None, min_length=1, max_length=300)
    is_done: Optional[bool] = None
    position: Optional[int] = Field(None, ge=1)
    block_id: Optional[int] = None


class QuarterReviewUpsert(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    on: date
    month_index: int = Field(..., ge=1, le=QUARTER_MONTHS)
    note: str = Field("", max_length=4000)


class QuarterRetrospectiveUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    on: date
    retrospective: Optional[str] = Field(None, max_length=4000)


class QuarterTaskOut(BaseModel):
    id: int
    position: int
    title: str
    is_done: bool
    done_at: Optional[datetime] = None


class QuarterBlockOut(BaseModel):
    id: int
    position: int
    title: str
    tasks: List[QuarterTaskOut]


class QuarterReviewOut(BaseModel):
    month_index: int
    month_start: date
    note: str


class QuarterOut(BaseModel):
    starts_on: date
    ends_on: date
    exists: bool
    blocks: List[QuarterBlockOut]
    reviews: List[QuarterReviewOut]
    retrospective: Optional[str] = None
    total: int
    done: int
    soft_max: int
    max_tasks: int


class QuarterHistoryItem(BaseModel):
    starts_on: date
    ends_on: date
    exists: bool
    total: int
    done: int
    needs_review: bool
