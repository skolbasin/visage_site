from collections import defaultdict
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_admin_user, get_db
from app.models.expense import (
    SYSTEM_CATEGORY_NAMES,
    Expense,
    ExpenseCategory,
    ExpensePayer,
    ExpenseRecurring,
    iter_occurrences,
)
from app.schemas.expense import (
    CategoryBreakdown,
    ExpenseCreate,
    ExpenseListOut,
    ExpenseOut,
    ExpenseSummary,
    ExpenseUpdate,
    ExpenseCategoryCreate,
    ExpenseCategoryOut,
    RecurringCreate,
    RecurringOut,
    RecurringUpdate,
)

router = APIRouter(prefix="/admin/expenses", tags=["admin-expenses"])

ZERO = Decimal("0")


def _ensure_system_categories(db: Session) -> None:
    existing = {
        name
        for (name,) in db.query(ExpenseCategory.name).filter(
            ExpenseCategory.name.in_(SYSTEM_CATEGORY_NAMES)
        )
    }
    missing = [name for name in SYSTEM_CATEGORY_NAMES if name not in existing]
    if not missing:
        return
    for name in missing:
        db.add(ExpenseCategory(name=name, is_system=True))
    db.commit()


def _get_category(db: Session, category_id: int) -> ExpenseCategory:
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Категория не найдена")
    return category


def _to_expense_out(item: Expense) -> ExpenseOut:
    return ExpenseOut(
        id=item.id,
        spent_on=item.spent_on,
        amount=item.amount,
        category_id=item.category_id,
        category_name=item.category.name if item.category else "",
        paid_by=item.paid_by,
        is_shared=item.is_shared,
        comment=item.comment,
        recurring_id=item.recurring_id,
        created_at=item.created_at,
    )


def _to_recurring_out(rule: ExpenseRecurring) -> RecurringOut:
    return RecurringOut(
        id=rule.id,
        title=rule.title,
        amount=rule.amount,
        category_id=rule.category_id,
        category_name=rule.category.name if rule.category else "",
        paid_by=rule.paid_by,
        is_shared=rule.is_shared,
        interval=rule.interval,
        start_date=rule.start_date,
        end_date=rule.end_date,
        is_active=rule.is_active,
    )


def _materialize_recurring(db: Session, range_from: date, range_to: date) -> None:
    rules = (
        db.query(ExpenseRecurring)
        .filter(ExpenseRecurring.is_active.is_(True))
        .all()
    )
    if not rules:
        return

    existing = (
        db.query(Expense.recurring_id, Expense.spent_on)
        .filter(
            Expense.recurring_id.in_([rule.id for rule in rules]),
            Expense.spent_on >= range_from,
            Expense.spent_on <= range_to,
        )
        .all()
    )
    existing_keys = {(row[0], row[1]) for row in existing}

    created = False
    for rule in rules:
        for spent_on in iter_occurrences(
            rule.start_date,
            rule.interval,
            range_from,
            range_to,
            rule.end_date,
        ):
            key = (rule.id, spent_on)
            if key in existing_keys:
                continue
            db.add(
                Expense(
                    spent_on=spent_on,
                    amount=rule.amount,
                    category_id=rule.category_id,
                    paid_by=rule.paid_by,
                    is_shared=rule.is_shared,
                    comment=rule.title,
                    recurring_id=rule.id,
                )
            )
            existing_keys.add(key)
            created = True

    if created:
        db.commit()


def _active_query(db: Session):
    return db.query(Expense).filter(Expense.deleted_at.is_(None))


def _build_summary(items: List[Expense]) -> ExpenseSummary:
    total = ZERO
    shared = ZERO
    personal = ZERO
    personal_sereja = ZERO
    personal_nastya = ZERO
    paid_sereja = ZERO
    paid_nastya = ZERO
    by_cat: dict[int, dict] = defaultdict(
        lambda: {"name": "", "total": ZERO, "count": 0}
    )

    for item in items:
        amount = Decimal(item.amount)
        total += amount
        if item.paid_by == ExpensePayer.sereja:
            paid_sereja += amount
        else:
            paid_nastya += amount
        if item.is_shared:
            shared += amount
        else:
            personal += amount
            if item.paid_by == ExpensePayer.sereja:
                personal_sereja += amount
            else:
                personal_nastya += amount
        bucket = by_cat[item.category_id]
        bucket["name"] = item.category.name if item.category else ""
        bucket["total"] += amount
        bucket["count"] += 1

    breakdown = [
        CategoryBreakdown(
            id=cat_id, name=data["name"], total=data["total"], count=data["count"]
        )
        for cat_id, data in sorted(
            by_cat.items(), key=lambda pair: pair[1]["total"], reverse=True
        )
    ]
    return ExpenseSummary(
        total=total,
        shared=shared,
        personal=personal,
        personal_sereja=personal_sereja,
        personal_nastya=personal_nastya,
        paid_sereja=paid_sereja,
        paid_nastya=paid_nastya,
        by_category=breakdown,
    )


@router.get("/categories", response_model=List[ExpenseCategoryOut])
def list_categories(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    _ensure_system_categories(db)
    return (
        db.query(ExpenseCategory)
        .order_by(ExpenseCategory.is_system.desc(), ExpenseCategory.name.asc())
        .all()
    )


@router.post("/categories", response_model=ExpenseCategoryOut)
def create_category(
    payload: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Укажите название категории")
    existing = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.name.ilike(name))
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Такая категория уже есть")
    category = ExpenseCategory(name=name, is_system=False)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    if category.is_system:
        raise HTTPException(status_code=400, detail="Базовую категорию нельзя удалить")
    used = (
        _active_query(db).filter(Expense.category_id == category_id).first()
        or db.query(ExpenseRecurring)
        .filter(ExpenseRecurring.category_id == category_id)
        .first()
    )
    if used:
        raise HTTPException(
            status_code=400, detail="Категория используется в тратах или повторах"
        )
    db.delete(category)
    db.commit()
    return {"ok": True}


@router.get("/recurring", response_model=List[RecurringOut])
def list_recurring(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    rules = (
        db.query(ExpenseRecurring)
        .options(joinedload(ExpenseRecurring.category))
        .order_by(ExpenseRecurring.is_active.desc(), ExpenseRecurring.id.desc())
        .all()
    )
    return [_to_recurring_out(rule) for rule in rules]


@router.post("/recurring", response_model=RecurringOut)
def create_recurring(
    payload: RecurringCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    _get_category(db, payload.category_id)
    if payload.end_date and payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="Дата окончания раньше старта")
    rule = ExpenseRecurring(
        title=payload.title.strip(),
        amount=payload.amount,
        category_id=payload.category_id,
        paid_by=payload.paid_by,
        is_shared=payload.is_shared,
        interval=payload.interval,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_active=payload.is_active,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    rule = (
        db.query(ExpenseRecurring)
        .options(joinedload(ExpenseRecurring.category))
        .filter(ExpenseRecurring.id == rule.id)
        .first()
    )
    return _to_recurring_out(rule)


@router.patch("/recurring/{rule_id}", response_model=RecurringOut)
def update_recurring(
    rule_id: int,
    payload: RecurringUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    rule = db.query(ExpenseRecurring).filter(ExpenseRecurring.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Правило не найдено")
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        data["title"] = data["title"].strip()
    if "category_id" in data:
        _get_category(db, data["category_id"])
    start = data.get("start_date", rule.start_date)
    end = data.get("end_date", rule.end_date)
    if end and start and end < start:
        raise HTTPException(status_code=400, detail="Дата окончания раньше старта")
    for key, value in data.items():
        setattr(rule, key, value)
    db.commit()
    rule = (
        db.query(ExpenseRecurring)
        .options(joinedload(ExpenseRecurring.category))
        .filter(ExpenseRecurring.id == rule_id)
        .first()
    )
    return _to_recurring_out(rule)


@router.delete("/recurring/{rule_id}")
def delete_recurring(
    rule_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    rule = db.query(ExpenseRecurring).filter(ExpenseRecurring.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Правило не найдено")
    db.query(Expense).filter(Expense.recurring_id == rule_id).update(
        {Expense.recurring_id: None}, synchronize_session=False
    )
    db.delete(rule)
    db.commit()
    return {"ok": True}


@router.get("", response_model=ExpenseListOut)
def list_expenses(
    date_from: Optional[date] = Query(None, alias="from"),
    date_to: Optional[date] = Query(None, alias="to"),
    paid_by: Optional[ExpensePayer] = Query(None),
    is_shared: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    _ensure_system_categories(db)
    today = date.today()
    range_from = date_from or today
    range_to = date_to or today
    if range_to < range_from:
        raise HTTPException(status_code=400, detail="Дата «по» раньше даты «с»")

    _materialize_recurring(db, range_from, range_to)

    query = (
        _active_query(db)
        .options(joinedload(Expense.category))
        .filter(Expense.spent_on >= range_from, Expense.spent_on <= range_to)
    )
    if paid_by is not None:
        query = query.filter(Expense.paid_by == paid_by)
    if is_shared is not None:
        query = query.filter(Expense.is_shared.is_(is_shared))

    items = query.order_by(Expense.spent_on.desc(), Expense.id.desc()).all()
    return ExpenseListOut(items=[_to_expense_out(i) for i in items], summary=_build_summary(items))


@router.post("", response_model=ExpenseOut)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    _get_category(db, payload.category_id)
    item = Expense(
        spent_on=payload.spent_on,
        amount=payload.amount,
        category_id=payload.category_id,
        paid_by=payload.paid_by,
        is_shared=payload.is_shared,
        comment=payload.comment.strip() if payload.comment else None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(Expense)
        .options(joinedload(Expense.category))
        .filter(Expense.id == item.id)
        .first()
    )
    return _to_expense_out(item)


@router.patch("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    item = _active_query(db).filter(Expense.id == expense_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Трата не найдена")
    data = payload.model_dump(exclude_unset=True)
    if "category_id" in data:
        _get_category(db, data["category_id"])
    if "comment" in data and data["comment"] is not None:
        data["comment"] = data["comment"].strip() or None
    for key, value in data.items():
        setattr(item, key, value)
    db.commit()
    item = (
        db.query(Expense)
        .options(joinedload(Expense.category))
        .filter(Expense.id == expense_id)
        .first()
    )
    return _to_expense_out(item)


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    item = _active_query(db).filter(Expense.id == expense_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Трата не найдена")
    item.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}
