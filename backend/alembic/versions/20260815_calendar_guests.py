"""extend calendar appointments: contact, workplace enum, guests, nullable price

Revision ID: 20260815_calendar_guests
Revises: 20260815_calendar
Create Date: 2026-08-15

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260815_calendar_guests"
down_revision: Union[str, None] = "20260815_calendar"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

workplace_enum = postgresql.ENUM(
    "studio",
    "apartment",
    "hotel",
    name="workplace",
    create_type=False,
)
appointment_type_enum = postgresql.ENUM(
    "hair",
    "makeup",
    "look",
    "trial_look",
    "wedding_look",
    "self_makeup",
    name="appointmenttype",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    workplace_enum.create(bind, checkfirst=True)

    op.alter_column(
        "calendar_appointments",
        "price",
        existing_type=sa.Numeric(precision=10, scale=2),
        nullable=True,
    )

    op.add_column(
        "calendar_appointments",
        sa.Column("contact", sa.String(), nullable=True),
    )
    op.execute(
        "UPDATE calendar_appointments SET contact = COALESCE(client_link, '') WHERE contact IS NULL"
    )
    op.alter_column("calendar_appointments", "contact", nullable=False)
    op.drop_column("calendar_appointments", "client_link")

    op.add_column(
        "calendar_appointments",
        sa.Column("workplace_new", workplace_enum, nullable=True),
    )
    op.execute(
        """
        UPDATE calendar_appointments
        SET workplace_new = CASE
            WHEN lower(workplace) LIKE '%квартир%' OR lower(workplace) LIKE '%apartment%' THEN 'apartment'::workplace
            WHEN lower(workplace) LIKE '%отел%' OR lower(workplace) LIKE '%hotel%' THEN 'hotel'::workplace
            ELSE 'studio'::workplace
        END
        """
    )
    op.drop_column("calendar_appointments", "workplace")
    op.alter_column(
        "calendar_appointments",
        "workplace_new",
        new_column_name="workplace",
        nullable=False,
    )

    op.create_table(
        "calendar_appointment_guests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("appointment_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("appointment_type", appointment_type_enum, nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.ForeignKeyConstraint(
            ["appointment_id"],
            ["calendar_appointments.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_calendar_appointment_guests_id"),
        "calendar_appointment_guests",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_calendar_appointment_guests_appointment_id"),
        "calendar_appointment_guests",
        ["appointment_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_calendar_appointment_guests_appointment_id"),
        table_name="calendar_appointment_guests",
    )
    op.drop_index(
        op.f("ix_calendar_appointment_guests_id"),
        table_name="calendar_appointment_guests",
    )
    op.drop_table("calendar_appointment_guests")

    op.add_column(
        "calendar_appointments",
        sa.Column("workplace_old", sa.String(), nullable=True),
    )
    op.execute(
        """
        UPDATE calendar_appointments
        SET workplace_old = CASE workplace::text
            WHEN 'apartment' THEN 'квартира'
            WHEN 'hotel' THEN 'отель'
            ELSE 'студия'
        END
        """
    )
    op.drop_column("calendar_appointments", "workplace")
    op.alter_column(
        "calendar_appointments",
        "workplace_old",
        new_column_name="workplace",
        nullable=False,
    )

    op.add_column(
        "calendar_appointments",
        sa.Column("client_link", sa.String(), nullable=True),
    )
    op.execute("UPDATE calendar_appointments SET client_link = contact")
    op.drop_column("calendar_appointments", "contact")

    op.alter_column(
        "calendar_appointments",
        "price",
        existing_type=sa.Numeric(precision=10, scale=2),
        nullable=False,
    )

    workplace_enum.drop(op.get_bind(), checkfirst=True)
