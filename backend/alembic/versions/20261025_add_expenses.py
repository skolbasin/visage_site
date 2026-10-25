"""add expenses, categories and recurring rules

Revision ID: 20261025_expenses
Revises: 20260816_outcomes
Create Date: 2026-10-25

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20261025_expenses"
down_revision: Union[str, None] = "20260816_outcomes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SYSTEM_CATEGORIES = (
    "Продукты",
    "Транспорт",
    "Кафе",
    "Жильё",
    "Коммуналка",
    "Связь",
    "Здоровье",
    "Красота",
    "Подписки",
    "Развлечения",
    "Одежда",
    "Прочее",
)

expense_payer_enum = sa.Enum("sereja", "nastya", name="expensepayer")
recurring_interval_enum = sa.Enum(
    "weekly", "monthly", "yearly", name="recurringinterval"
)


def upgrade() -> None:
    expense_payer_enum.create(op.get_bind(), checkfirst=True)
    recurring_interval_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "expense_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        op.f("ix_expense_categories_id"), "expense_categories", ["id"], unique=False
    )

    categories = sa.table(
        "expense_categories",
        sa.column("name", sa.String),
        sa.column("is_system", sa.Boolean),
    )
    op.bulk_insert(
        categories,
        [{"name": name, "is_system": True} for name in SYSTEM_CATEGORIES],
    )

    op.create_table(
        "expense_recurring",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("paid_by", expense_payer_enum, nullable=False),
        sa.Column("is_shared", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("interval", recurring_interval_enum, nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["expense_categories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_expense_recurring_id"), "expense_recurring", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_expense_recurring_category_id"),
        "expense_recurring",
        ["category_id"],
        unique=False,
    )

    op.create_table(
        "expenses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("spent_on", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("paid_by", expense_payer_enum, nullable=False),
        sa.Column("is_shared", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("recurring_id", sa.Integer(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["expense_categories.id"]),
        sa.ForeignKeyConstraint(["recurring_id"], ["expense_recurring.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "recurring_id", "spent_on", name="uq_expense_recurring_spent_on"
        ),
    )
    op.create_index(op.f("ix_expenses_id"), "expenses", ["id"], unique=False)
    op.create_index(op.f("ix_expenses_spent_on"), "expenses", ["spent_on"], unique=False)
    op.create_index(
        op.f("ix_expenses_category_id"), "expenses", ["category_id"], unique=False
    )
    op.create_index(op.f("ix_expenses_paid_by"), "expenses", ["paid_by"], unique=False)
    op.create_index(
        op.f("ix_expenses_is_shared"), "expenses", ["is_shared"], unique=False
    )
    op.create_index(
        op.f("ix_expenses_recurring_id"), "expenses", ["recurring_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_expenses_recurring_id"), table_name="expenses")
    op.drop_index(op.f("ix_expenses_is_shared"), table_name="expenses")
    op.drop_index(op.f("ix_expenses_paid_by"), table_name="expenses")
    op.drop_index(op.f("ix_expenses_category_id"), table_name="expenses")
    op.drop_index(op.f("ix_expenses_spent_on"), table_name="expenses")
    op.drop_index(op.f("ix_expenses_id"), table_name="expenses")
    op.drop_table("expenses")

    op.drop_index(op.f("ix_expense_recurring_category_id"), table_name="expense_recurring")
    op.drop_index(op.f("ix_expense_recurring_id"), table_name="expense_recurring")
    op.drop_table("expense_recurring")

    op.drop_index(op.f("ix_expense_categories_id"), table_name="expense_categories")
    op.drop_table("expense_categories")

    recurring_interval_enum.drop(op.get_bind(), checkfirst=True)
    expense_payer_enum.drop(op.get_bind(), checkfirst=True)
