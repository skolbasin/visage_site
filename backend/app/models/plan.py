from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.db.base_class import Base


class PlanItem(Base):
    __tablename__ = "plan_items"
    __table_args__ = (
        CheckConstraint(
            "(period_type = 'year' AND quarter IS NULL) OR "
            "(period_type = 'quarter' AND quarter BETWEEN 1 AND 4)",
            name="ck_plan_item_quarter",
        ),
        CheckConstraint(
            "progress_type != 'metric' OR (target_value IS NOT NULL AND target_value > 0)",
            name="ck_plan_item_metric_target",
        ),
        CheckConstraint(
            "progress_type = 'metric' OR (target_value IS NULL AND current_value IS NULL)",
            name="ck_plan_item_checkbox_values",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    owner = Column(String(16), nullable=False, index=True)
    period_type = Column(String(16), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    quarter = Column(Integer, nullable=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    progress_type = Column(String(16), nullable=False, default="checkbox")
    target_value = Column(Numeric(14, 3), nullable=True)
    current_value = Column(Numeric(14, 3), nullable=True)
    unit = Column(String(40), nullable=True)
    is_done = Column(Boolean, nullable=False, default=False)
    done_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
