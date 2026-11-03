from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.marketing import TOP5_MAX_TASKS, TOP5_WEEKDAY_MAX, TOP5_WEEKDAY_MIN


class Top5TaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    week: date
    title: str = Field(..., min_length=1, max_length=300)
    owner: Optional[str] = Field(None, max_length=80)
    weekday: Optional[int] = Field(None, ge=TOP5_WEEKDAY_MIN, le=TOP5_WEEKDAY_MAX)


class Top5TaskUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(None, min_length=1, max_length=300)
    owner: Optional[str] = Field(None, max_length=80)
    weekday: Optional[int] = Field(None, ge=TOP5_WEEKDAY_MIN, le=TOP5_WEEKDAY_MAX)
    is_done: Optional[bool] = None
    position: Optional[int] = Field(None, ge=1, le=TOP5_MAX_TASKS)


class Top5TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: int
    title: str
    owner: Optional[str] = None
    weekday: Optional[int] = None
    is_done: bool
    done_at: Optional[datetime] = None


class Top5WeekOut(BaseModel):
    week_start: date
    week_end: date
    tasks: List[Top5TaskOut]
    total: int
    done: int
    min_tasks: int
    max_tasks: int


class Top5HistoryItem(BaseModel):
    week_start: date
    week_end: date
    total: int
    done: int
