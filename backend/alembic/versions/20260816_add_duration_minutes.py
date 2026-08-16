"""add editable duration_minutes for appointments and guests

Revision ID: 20260816_duration
Revises: 20260815_calendar_guests
Create Date: 2026-08-16

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260816_duration"
down_revision: Union[str, None] = "20260815_calendar_guests"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "calendar_appointments",
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
    )
    op.execute(
        """
        UPDATE calendar_appointments
        SET duration_minutes = CASE appointment_type::text
            WHEN 'hair' THEN 90
            WHEN 'makeup' THEN 90
            WHEN 'look' THEN 150
            WHEN 'wedding_look' THEN 150
            WHEN 'trial_look' THEN 180
            WHEN 'self_makeup' THEN 180
            ELSE 90
        END
        WHERE duration_minutes IS NULL
        """
    )
    op.alter_column(
        "calendar_appointments",
        "duration_minutes",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.add_column(
        "calendar_appointment_guests",
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
    )
    op.execute(
        """
        UPDATE calendar_appointment_guests
        SET duration_minutes = CASE appointment_type::text
            WHEN 'hair' THEN 90
            WHEN 'makeup' THEN 90
            WHEN 'look' THEN 150
            WHEN 'wedding_look' THEN 150
            WHEN 'trial_look' THEN 180
            WHEN 'self_makeup' THEN 180
            ELSE 90
        END
        WHERE duration_minutes IS NULL
        """
    )
    op.alter_column(
        "calendar_appointment_guests",
        "duration_minutes",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column("calendar_appointment_guests", "duration_minutes")
    op.drop_column("calendar_appointments", "duration_minutes")
