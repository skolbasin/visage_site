"""add monthly marketing source metrics

Revision ID: 20261116_traffic_sources
Revises: 20261115_plan_items
Create Date: 2026-11-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261116_traffic_sources"
down_revision: Union[str, None] = "20261115_plan_items"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "marketing_traffic_metrics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=24), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("ad_spend", sa.Numeric(12, 2), nullable=True),
        sa.Column("subscription_cost", sa.Numeric(12, 2), nullable=True),
        sa.Column("subscription_active", sa.Boolean(), nullable=True),
        sa.Column("followers_count", sa.Integer(), nullable=True),
        sa.Column("reels_count", sa.Integer(), nullable=True),
        sa.Column("initiatives", sa.Text(), nullable=True),
        sa.Column("views_count", sa.Integer(), nullable=True),
        sa.Column("pins_count", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "source IN ('profi_ru', 'instagram', 'pinterest')",
            name="ck_marketing_traffic_source",
        ),
        sa.CheckConstraint(
            "year >= 2000 AND year <= 2200",
            name="ck_marketing_traffic_year",
        ),
        sa.CheckConstraint(
            "month >= 1 AND month <= 12",
            name="ck_marketing_traffic_month",
        ),
        sa.CheckConstraint(
            "ad_spend IS NULL OR ad_spend >= 0",
            name="ck_marketing_traffic_ad_spend",
        ),
        sa.CheckConstraint(
            "subscription_cost IS NULL OR subscription_cost >= 0",
            name="ck_marketing_traffic_subscription_cost",
        ),
        sa.CheckConstraint(
            "followers_count IS NULL OR followers_count >= 0",
            name="ck_marketing_traffic_followers",
        ),
        sa.CheckConstraint(
            "reels_count IS NULL OR reels_count >= 0",
            name="ck_marketing_traffic_reels",
        ),
        sa.CheckConstraint(
            "views_count IS NULL OR views_count >= 0",
            name="ck_marketing_traffic_views",
        ),
        sa.CheckConstraint(
            "pins_count IS NULL OR pins_count >= 0",
            name="ck_marketing_traffic_pins",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "source",
            "year",
            "month",
            name="uq_marketing_traffic_source_period",
        ),
    )
    op.create_index(
        "ix_marketing_traffic_metrics_source",
        "marketing_traffic_metrics",
        ["source"],
    )
    op.create_index(
        "ix_marketing_traffic_metrics_year",
        "marketing_traffic_metrics",
        ["year"],
    )
    op.create_index(
        "ix_marketing_traffic_metrics_id",
        "marketing_traffic_metrics",
        ["id"],
    )


def downgrade() -> None:
    op.drop_index("ix_marketing_traffic_metrics_id", table_name="marketing_traffic_metrics")
    op.drop_index("ix_marketing_traffic_metrics_year", table_name="marketing_traffic_metrics")
    op.drop_index("ix_marketing_traffic_metrics_source", table_name="marketing_traffic_metrics")
    op.drop_table("marketing_traffic_metrics")
