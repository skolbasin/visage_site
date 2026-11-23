"""add client base tables and seed from calendar

Revision ID: 20261123_clients
Revises: 20261116_traffic_sources
Create Date: 2026-11-23
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261123_clients"
down_revision: Union[str, None] = "20261116_traffic_sources"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("instagram", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("other_contacts", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_clients_id", "clients", ["id"])

    op.create_table(
        "client_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("cost", sa.Numeric(10, 2), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["client_id"], ["clients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_client_events_id", "client_events", ["id"])
    op.create_index("ix_client_events_client_id", "client_events", ["client_id"])

    bind = op.get_bind()
    calendar = sa.table(
        "calendar_appointments",
        sa.column("id", sa.Integer()),
        sa.column("name", sa.String()),
        sa.column("contact", sa.String()),
        sa.column("appointment_type", sa.String()),
        sa.column("starts_at", sa.DateTime(timezone=True)),
        sa.column("price", sa.Numeric(10, 2)),
        sa.column("comment", sa.Text()),
    )
    appointments = bind.execute(
        sa.select(calendar.c.name, calendar.c.contact, calendar.c.appointment_type,
                  calendar.c.starts_at, calendar.c.price, calendar.c.comment,
                  calendar.c.id)
        .order_by(calendar.c.starts_at.asc())
    ).mappings().all()

    clients_table = sa.table(
        "clients",
        sa.column("id", sa.Integer()),
        sa.column("name", sa.String()),
        sa.column("phone", sa.String()),
        sa.column("instagram", sa.String()),
    )
    events_table = sa.table(
        "client_events",
        sa.column("client_id", sa.Integer()),
        sa.column("event_type", sa.String()),
        sa.column("event_date", sa.DateTime(timezone=True)),
        sa.column("cost", sa.Numeric(10, 2)),
        sa.column("comment", sa.Text()),
    )

    client_ids = {}
    for row in appointments:
        name = (row["name"] or "").strip()
        contact = (row["contact"] or "").strip()
        key = name.casefold()
        if not key:
            continue
        client_id = client_ids.get(key)
        if client_id is None:
            phone = contact if contact and any(char.isdigit() for char in contact) else None
            instagram = contact if contact and ("@" in contact or "instagram" in contact.lower()) else None
            result = bind.execute(
                sa.insert(clients_table).values(name=name, phone=phone, instagram=instagram)
                .returning(clients_table.c.id)
            )
            client_id = result.scalar_one()
            client_ids[key] = client_id

        bind.execute(sa.insert(events_table).values(
            client_id=client_id,
            event_type=row["appointment_type"],
            event_date=row["starts_at"],
            cost=row["price"],
            comment=row["comment"],
        ))

        guests = sa.table(
            "calendar_appointment_guests",
            sa.column("appointment_id", sa.Integer()),
            sa.column("name", sa.String()),
            sa.column("appointment_type", sa.String()),
            sa.column("price", sa.Numeric(10, 2)),
        )
        guest_rows = bind.execute(
            sa.select(guests.c.name, guests.c.appointment_type, guests.c.price)
            .where(guests.c.appointment_id == row["id"])
        ).mappings().all()
        for guest in guest_rows:
            guest_name = (guest["name"] or "").strip()
            if not guest_name:
                continue
            guest_key = guest_name.casefold()
            guest_client_id = client_ids.get(guest_key)
            if guest_client_id is None:
                result = bind.execute(
                    sa.insert(clients_table).values(name=guest_name)
                    .returning(clients_table.c.id)
                )
                guest_client_id = result.scalar_one()
                client_ids[guest_key] = guest_client_id
            bind.execute(sa.insert(events_table).values(
                client_id=guest_client_id,
                event_type=guest["appointment_type"],
                event_date=row["starts_at"],
                cost=guest["price"],
                comment=row["comment"],
            ))


def downgrade() -> None:
    op.drop_index("ix_client_events_client_id", table_name="client_events")
    op.drop_index("ix_client_events_id", table_name="client_events")
    op.drop_table("client_events")
    op.drop_index("ix_clients_id", table_name="clients")
    op.drop_table("clients")
