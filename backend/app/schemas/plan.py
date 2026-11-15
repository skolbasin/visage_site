from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

PlanOwner = Literal["nastya", "sereja"]
PlanPeriod = Literal["year", "quarter"]
ProgressType = Literal["checkbox", "metric"]


class PlanItemFields(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    owner: PlanOwner
    period_type: PlanPeriod
    year: int = Field(..., ge=2000, le=2200)
    quarter: Optional[int] = Field(None, ge=1, le=4)
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=5000)
    progress_type: ProgressType = "checkbox"
    target_value: Optional[Decimal] = Field(None, gt=0, max_digits=14, decimal_places=3)
    current_value: Optional[Decimal] = Field(
        None, ge=0, max_digits=14, decimal_places=3
    )
    unit: Optional[str] = Field(None, max_length=40)

    @model_validator(mode="after")
    def validate_period_and_progress(self):
        if self.period_type == "year" and self.quarter is not None:
            raise ValueError("Для годового плана квартал не указывается")
        if self.period_type == "quarter" and self.quarter is None:
            raise ValueError("Для квартального плана необходимо указать квартал")
        if self.progress_type == "metric":
            if self.target_value is None:
                raise ValueError("Для измеримого плана необходимо указать цель")
            if self.current_value is None:
                self.current_value = Decimal("0")
            self.unit = self.unit or None
        elif any(
            value is not None
            for value in (self.target_value, self.current_value, self.unit)
        ):
            raise ValueError("Для обычной задачи параметры измерения не указываются")
        return self


class PlanItemCreate(PlanItemFields):
    pass


class PlanItemUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=5000)
    target_value: Optional[Decimal] = Field(None, gt=0, max_digits=14, decimal_places=3)
    current_value: Optional[Decimal] = Field(
        None, ge=0, max_digits=14, decimal_places=3
    )
    unit: Optional[str] = Field(None, max_length=40)
    is_done: Optional[bool] = None


class PlanItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner: PlanOwner
    period_type: PlanPeriod
    year: int
    quarter: Optional[int] = None
    title: str
    description: Optional[str] = None
    progress_type: ProgressType
    target_value: Optional[Decimal] = None
    current_value: Optional[Decimal] = None
    unit: Optional[str] = None
    is_done: bool
    done_at: Optional[datetime] = None
