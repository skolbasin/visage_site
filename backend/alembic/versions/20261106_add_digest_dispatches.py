"""remember morning digest sends

Revision ID: 20261106_digest
Revises: 20261103_quarters
Create Date: 2026-11-06

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261106_digest"
down_revision: Union[str, None] = "20261103_quarters"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    existing = set(sa.inspect(bind).get_table_names())
    if "digest_dispatches" in existing:
        return
    op.create_table(
        "digest_dispatches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sent_on", sa.Date(), nullable=False),
        sa.Column("recipient", sa.String(length=320), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "sent_on",
            "recipient",
            name="uq_digest_dispatch_day_recipient",
        ),
    )
    op.create_index(
        "ix_digest_dispatches_sent_on",
        "digest_dispatches",
        ["sent_on"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_digest_dispatches_sent_on", table_name="digest_dispatches")
    op.drop_table("digest_dispatches")
