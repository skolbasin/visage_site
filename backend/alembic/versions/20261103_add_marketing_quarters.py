"""add marketing 90-day quarters

Revision ID: 20261103_quarters
Revises: 20261103_top5
Create Date: 2026-11-03

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261103_quarters"
down_revision: Union[str, None] = "20261103_top5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())

    if "marketing_quarters" not in existing:
        op.create_table(
            "marketing_quarters",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("starts_on", sa.Date(), nullable=False),
            sa.Column("retrospective", sa.Text(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("starts_on"),
        )
        op.create_index(
            op.f("ix_marketing_quarters_id"), "marketing_quarters", ["id"], unique=False
        )
        op.create_index(
            op.f("ix_marketing_quarters_starts_on"),
            "marketing_quarters",
            ["starts_on"],
            unique=False,
        )

    if "marketing_quarter_blocks" not in existing:
        op.create_table(
            "marketing_quarter_blocks",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("quarter_id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=80), nullable=False),
            sa.Column("position", sa.Integer(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.CheckConstraint(
                "position >= 1", name="ck_marketing_quarter_block_position"
            ),
            sa.ForeignKeyConstraint(
                ["quarter_id"], ["marketing_quarters.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_marketing_quarter_blocks_id"),
            "marketing_quarter_blocks",
            ["id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_marketing_quarter_blocks_quarter_id"),
            "marketing_quarter_blocks",
            ["quarter_id"],
            unique=False,
        )

    if "marketing_quarter_tasks" not in existing:
        op.create_table(
            "marketing_quarter_tasks",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("block_id", sa.Integer(), nullable=False),
            sa.Column("position", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=300), nullable=False),
            sa.Column(
                "is_done", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
            sa.Column("done_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
            sa.CheckConstraint(
                "position >= 1", name="ck_marketing_quarter_task_position"
            ),
            sa.ForeignKeyConstraint(
                ["block_id"], ["marketing_quarter_blocks.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            op.f("ix_marketing_quarter_tasks_id"),
            "marketing_quarter_tasks",
            ["id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_marketing_quarter_tasks_block_id"),
            "marketing_quarter_tasks",
            ["block_id"],
            unique=False,
        )

    if "marketing_quarter_reviews" not in existing:
        op.create_table(
            "marketing_quarter_reviews",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("quarter_id", sa.Integer(), nullable=False),
            sa.Column("month_index", sa.Integer(), nullable=False),
            sa.Column("note", sa.Text(), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint(
                "month_index >= 1 AND month_index <= 3",
                name="ck_marketing_quarter_review_month",
            ),
            sa.ForeignKeyConstraint(
                ["quarter_id"], ["marketing_quarters.id"], ondelete="CASCADE"
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "quarter_id",
                "month_index",
                name="uq_marketing_quarter_review_month",
            ),
        )
        op.create_index(
            op.f("ix_marketing_quarter_reviews_id"),
            "marketing_quarter_reviews",
            ["id"],
            unique=False,
        )
        op.create_index(
            op.f("ix_marketing_quarter_reviews_quarter_id"),
            "marketing_quarter_reviews",
            ["quarter_id"],
            unique=False,
        )


def downgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())
    if "marketing_quarter_reviews" in existing:
        op.drop_index(
            op.f("ix_marketing_quarter_reviews_quarter_id"),
            table_name="marketing_quarter_reviews",
        )
        op.drop_index(
            op.f("ix_marketing_quarter_reviews_id"),
            table_name="marketing_quarter_reviews",
        )
        op.drop_table("marketing_quarter_reviews")
    if "marketing_quarter_tasks" in existing:
        op.drop_index(
            op.f("ix_marketing_quarter_tasks_block_id"),
            table_name="marketing_quarter_tasks",
        )
        op.drop_index(
            op.f("ix_marketing_quarter_tasks_id"),
            table_name="marketing_quarter_tasks",
        )
        op.drop_table("marketing_quarter_tasks")
    if "marketing_quarter_blocks" in existing:
        op.drop_index(
            op.f("ix_marketing_quarter_blocks_quarter_id"),
            table_name="marketing_quarter_blocks",
        )
        op.drop_index(
            op.f("ix_marketing_quarter_blocks_id"),
            table_name="marketing_quarter_blocks",
        )
        op.drop_table("marketing_quarter_blocks")
    if "marketing_quarters" in existing:
        op.drop_index(
            op.f("ix_marketing_quarters_starts_on"), table_name="marketing_quarters"
        )
        op.drop_index(op.f("ix_marketing_quarters_id"), table_name="marketing_quarters")
        op.drop_table("marketing_quarters")
