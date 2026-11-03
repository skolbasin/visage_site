"""add marketing top-5 weeks and tasks

Revision ID: 20261103_top5
Revises: 20261025_expenses
Create Date: 2026-11-03

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261103_top5"
down_revision: Union[str, None] = "20261025_expenses"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())

    if "marketing_top5_weeks" not in existing:
        op.create_table(
            "marketing_top5_weeks",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("week_start", sa.Date(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("week_start"),
        )
        op.create_index(
            op.f("ix_marketing_top5_weeks_id"),
            "marketing_top5_weeks",
            ["id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_marketing_top5_weeks_week_start"),
            "marketing_top5_weeks",
            ["week_start"],
            unique=False,
        )

    if "marketing_top5_tasks" not in existing:
        op.create_table(
            "marketing_top5_tasks",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("week_id", sa.Integer(), nullable=False),
            sa.Column("position", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=300), nullable=False),
            sa.Column("owner", sa.String(length=80), nullable=True),
            sa.Column("weekday", sa.Integer(), nullable=True),
            sa.Column(
                "is_done",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
            sa.Column("done_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.CheckConstraint("position >= 1", name="ck_marketing_top5_position"),
            sa.CheckConstraint(
                "weekday IS NULL OR (weekday >= 0 AND weekday <= 4)",
                name="ck_marketing_top5_weekday",
            ),
            sa.ForeignKeyConstraint(
                ["week_id"],
                ["marketing_top5_weeks.id"],
                ondelete="CASCADE",
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_marketing_top5_tasks_id"),
            "marketing_top5_tasks",
            ["id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_marketing_top5_tasks_week_id"),
            "marketing_top5_tasks",
            ["week_id"],
            unique=False,
        )


def downgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())
    if "marketing_top5_tasks" in existing:
        op.drop_index(
            op.f("ix_marketing_top5_tasks_week_id"),
            table_name="marketing_top5_tasks",
        )
        op.drop_index(
            op.f("ix_marketing_top5_tasks_id"),
            table_name="marketing_top5_tasks",
        )
        op.drop_table("marketing_top5_tasks")
    if "marketing_top5_weeks" in existing:
        op.drop_index(
            op.f("ix_marketing_top5_weeks_week_start"),
            table_name="marketing_top5_weeks",
        )
        op.drop_index(
            op.f("ix_marketing_top5_weeks_id"),
            table_name="marketing_top5_weeks",
        )
        op.drop_table("marketing_top5_weeks")
