from decimal import Decimal
from typing import Dict, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


TrafficSource = Literal["profi_ru", "instagram", "pinterest"]


class TrafficMetricUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    ad_spend: Optional[Decimal] = Field(None, ge=0, max_digits=12, decimal_places=2)
    subscription_cost: Optional[Decimal] = Field(
        None, ge=0, max_digits=12, decimal_places=2
    )
    subscription_active: Optional[bool] = None
    followers_count: Optional[int] = Field(None, ge=0, le=2_000_000_000)
    reels_count: Optional[int] = Field(None, ge=0, le=2_000_000_000)
    initiatives: Optional[str] = Field(None, max_length=10_000)
    views_count: Optional[int] = Field(None, ge=0, le=2_000_000_000)
    pins_count: Optional[int] = Field(None, ge=0, le=2_000_000_000)


class TrafficMonthOut(BaseModel):
    month: int
    applications: int
    follower_growth_pct: Optional[float] = None
    ad_spend: Optional[Decimal] = None
    subscription_cost: Optional[Decimal] = None
    subscription_active: Optional[bool] = None
    followers_count: Optional[int] = None
    reels_count: Optional[int] = None
    initiatives: Optional[str] = None
    views_count: Optional[int] = None
    pins_count: Optional[int] = None


class TrafficYearOut(BaseModel):
    year: int
    sources: Dict[TrafficSource, list[TrafficMonthOut]]
