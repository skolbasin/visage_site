"""add personal year and quarter plans

Revision ID: 20261115_plan_items
Revises: 20261106_digest
Create Date: 2026-11-15
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261115_plan_items"
down_revision: Union[str, None] = "20261106_digest"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "plan_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner", sa.String(length=16), nullable=False),
        sa.Column("period_type", sa.String(length=16), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("quarter", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("progress_type", sa.String(length=16), nullable=False),
        sa.Column("target_value", sa.Numeric(14, 3), nullable=True),
        sa.Column("current_value", sa.Numeric(14, 3), nullable=True),
        sa.Column("unit", sa.String(length=40), nullable=True),
        sa.Column("is_done", sa.Boolean(), nullable=False),
        sa.Column("done_at", sa.DateTime(timezone=True), nullable=True),
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
            "(period_type = 'year' AND quarter IS NULL) OR "
            "(period_type = 'quarter' AND quarter BETWEEN 1 AND 4)",
            name="ck_plan_item_quarter",
        ),
        sa.CheckConstraint(
            "progress_type != 'metric' OR (target_value IS NOT NULL AND target_value > 0)",
            name="ck_plan_item_metric_target",
        ),
        sa.CheckConstraint(
            "progress_type = 'metric' OR (target_value IS NULL AND current_value IS NULL)",
            name="ck_plan_item_checkbox_values",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_plan_items_id", "plan_items", ["id"], unique=False)
    op.create_index("ix_plan_items_owner", "plan_items", ["owner"], unique=False)
    op.create_index(
        "ix_plan_items_period_type", "plan_items", ["period_type"], unique=False
    )
    op.create_index("ix_plan_items_year", "plan_items", ["year"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_plan_items_year", table_name="plan_items")
    op.drop_index("ix_plan_items_period_type", table_name="plan_items")
    op.drop_index("ix_plan_items_owner", table_name="plan_items")
    op.drop_index("ix_plan_items_id", table_name="plan_items")
    op.drop_table("plan_items")
