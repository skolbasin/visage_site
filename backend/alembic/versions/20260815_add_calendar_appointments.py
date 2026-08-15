"""add calendar_appointments table

Revision ID: 20260815_calendar
Revises:
Create Date: 2026-08-15

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260815_calendar"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

client_source_enum = sa.Enum(
    "instagram",
    "profi",
    "website",
    "referral",
    "returning",
    "other",
    name="clientsource",
)
appointment_type_enum = sa.Enum(
    "hair",
    "makeup",
    "look",
    "trial_look",
    "wedding_look",
    "self_makeup",
    name="appointmenttype",
)
appointment_status_enum = sa.Enum(
    "scheduled",
    "completed",
    "cancelled",
    "no_show",
    name="appointmentstatus",
)


def upgrade() -> None:
    op.create_table(
        "calendar_appointments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("client_source", client_source_enum, nullable=False),
        sa.Column("client_source_other", sa.String(), nullable=True),
        sa.Column("appointment_type", appointment_type_enum, nullable=False),
        sa.Column("client_link", sa.String(), nullable=True),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("has_prepayment", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("prepayment_amount", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("workplace", sa.String(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column(
            "status",
            appointment_status_enum,
            nullable=False,
            server_default="scheduled",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_calendar_appointments_id"),
        "calendar_appointments",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_calendar_appointments_starts_at"),
        "calendar_appointments",
        ["starts_at"],
        unique=False,
    )
    op.create_index(
        op.f("ix_calendar_appointments_ends_at"),
        "calendar_appointments",
        ["ends_at"],
        unique=False,
    )
    op.create_index(
        op.f("ix_calendar_appointments_status"),
        "calendar_appointments",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_calendar_appointments_status"), table_name="calendar_appointments")
    op.drop_index(op.f("ix_calendar_appointments_ends_at"), table_name="calendar_appointments")
    op.drop_index(op.f("ix_calendar_appointments_starts_at"), table_name="calendar_appointments")
    op.drop_index(op.f("ix_calendar_appointments_id"), table_name="calendar_appointments")
    op.drop_table("calendar_appointments")
    appointment_status_enum.drop(op.get_bind(), checkfirst=True)
    appointment_type_enum.drop(op.get_bind(), checkfirst=True)
    client_source_enum.drop(op.get_bind(), checkfirst=True)
