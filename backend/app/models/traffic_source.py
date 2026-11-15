from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.db.base_class import Base


class MarketingTrafficMetric(Base):
    __tablename__ = "marketing_traffic_metrics"
    __table_args__ = (
        UniqueConstraint(
            "source",
            "year",
            "month",
            name="uq_marketing_traffic_source_period",
        ),
        CheckConstraint(
            "source IN ('profi_ru', 'instagram', 'pinterest')",
            name="ck_marketing_traffic_source",
        ),
        CheckConstraint("year >= 2000 AND year <= 2200", name="ck_marketing_traffic_year"),
        CheckConstraint("month >= 1 AND month <= 12", name="ck_marketing_traffic_month"),
        CheckConstraint(
            "ad_spend IS NULL OR ad_spend >= 0",
            name="ck_marketing_traffic_ad_spend",
        ),
        CheckConstraint(
            "subscription_cost IS NULL OR subscription_cost >= 0",
            name="ck_marketing_traffic_subscription_cost",
        ),
        CheckConstraint(
            "followers_count IS NULL OR followers_count >= 0",
            name="ck_marketing_traffic_followers",
        ),
        CheckConstraint(
            "reels_count IS NULL OR reels_count >= 0",
            name="ck_marketing_traffic_reels",
        ),
        CheckConstraint(
            "views_count IS NULL OR views_count >= 0",
            name="ck_marketing_traffic_views",
        ),
        CheckConstraint(
            "pins_count IS NULL OR pins_count >= 0",
            name="ck_marketing_traffic_pins",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(24), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False)
    ad_spend = Column(Numeric(12, 2), nullable=True)
    subscription_cost = Column(Numeric(12, 2), nullable=True)
    subscription_active = Column(Boolean, nullable=True)
    followers_count = Column(Integer, nullable=True)
    reels_count = Column(Integer, nullable=True)
    initiatives = Column(Text, nullable=True)
    views_count = Column(Integer, nullable=True)
    pins_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
