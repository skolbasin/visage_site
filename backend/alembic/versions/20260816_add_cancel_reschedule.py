"""add cancel/reschedule tracking fields

Revision ID: 20260816_outcomes
Revises: 20260816_duration
Create Date: 2026-08-16

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260816_outcomes"
down_revision: Union[str, None] = "20260816_duration"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

cancel_reason_enum = postgresql.ENUM(
    "client_cancelled",
    "feeling_unwell",
    "schedule_conflict",
    "force_majeure",
    "other",
    name="cancelreason",
    create_type=False,
)


def upgrade() -> None:
    cancel_reason_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "calendar_appointments",
        sa.Column("cancel_reason", cancel_reason_enum, nullable=True),
    )
    op.add_column(
        "calendar_appointments",
        sa.Column("cancel_reason_other", sa.String(), nullable=True),
    )
    op.add_column(
        "calendar_appointments",
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "calendar_appointments",
        sa.Column(
            "reschedule_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )
    op.add_column(
        "calendar_appointments",
        sa.Column("last_reschedule_reason", sa.Text(), nullable=True),
    )
    op.add_column(
        "calendar_appointments",
        sa.Column("last_rescheduled_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("calendar_appointments", "last_rescheduled_at")
    op.drop_column("calendar_appointments", "last_reschedule_reason")
    op.drop_column("calendar_appointments", "reschedule_count")
    op.drop_column("calendar_appointments", "cancelled_at")
    op.drop_column("calendar_appointments", "cancel_reason_other")
    op.drop_column("calendar_appointments", "cancel_reason")
    cancel_reason_enum.drop(op.get_bind(), checkfirst=True)
