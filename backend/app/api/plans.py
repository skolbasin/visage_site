from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.plan import PlanItem
from app.models.user import User
from app.schemas.plan import PlanItemCreate, PlanItemOut, PlanItemUpdate

router = APIRouter(prefix="/admin/plans", tags=["admin-plans"])


def _item_out(item: PlanItem) -> PlanItemOut:
    is_done = (
        item.current_value >= item.target_value
        if item.progress_type == "metric"
        else item.is_done
    )
    return PlanItemOut(
        id=item.id,
        owner=item.owner,
        period_type=item.period_type,
        year=item.year,
        quarter=item.quarter,
        title=item.title,
        description=item.description,
        progress_type=item.progress_type,
        target_value=item.target_value,
        current_value=item.current_value,
        unit=item.unit,
        is_done=is_done,
        done_at=item.done_at,
    )


def _require_item(db: Session, item_id: int) -> PlanItem:
    item = db.query(PlanItem).filter(PlanItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="План не найден")
    return item


@router.get("", response_model=List[PlanItemOut])
def list_plan_items(
    owner: str = Query(..., pattern="^(nastya|sereja)$"),
    period_type: str = Query(..., pattern="^(year|quarter)$"),
    year: int = Query(..., ge=2000, le=2200),
    quarter: Optional[int] = Query(None, ge=1, le=4),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    if period_type == "year" and quarter is not None:
        raise HTTPException(
            status_code=422, detail="Для годового плана квартал не указывается"
        )
    if period_type == "quarter" and quarter is None:
        raise HTTPException(
            status_code=422, detail="Для квартального плана необходимо указать квартал"
        )

    query = db.query(PlanItem).filter(
        PlanItem.owner == owner,
        PlanItem.period_type == period_type,
        PlanItem.year == year,
    )
    if period_type == "quarter":
        query = query.filter(PlanItem.quarter == quarter)
    else:
        query = query.filter(PlanItem.quarter.is_(None))
    items = query.order_by(PlanItem.created_at, PlanItem.id).all()
    return [_item_out(item) for item in items]


@router.post("", response_model=PlanItemOut)
def create_plan_item(
    payload: PlanItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    item = PlanItem(**payload.model_dump())
    if item.progress_type == "metric" and item.current_value >= item.target_value:
        item.done_at = datetime.now(timezone.utc)
    db.add(item)
    db.commit()
    db.refresh(item)
    return _item_out(item)


@router.patch("/{item_id}", response_model=PlanItemOut)
def update_plan_item(
    item_id: int,
    payload: PlanItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    item = _require_item(db, item_id)
    updates = payload.model_dump(exclude_unset=True)
    if any(
        updates.get(field) is None for field in ("title", "is_done") if field in updates
    ):
        raise HTTPException(status_code=422, detail="Некорректное значение поля")
    if item.progress_type == "checkbox" and "is_done" in updates:
        item.is_done = updates.pop("is_done")
        item.done_at = datetime.now(timezone.utc) if item.is_done else None
    elif item.progress_type == "metric" and "is_done" in updates:
        raise HTTPException(
            status_code=422,
            detail="Выполнение измеримого плана определяется прогрессом",
        )
    if item.progress_type == "metric":
        if any(
            field in updates and updates[field] is None
            for field in ("target_value", "current_value")
        ):
            raise HTTPException(
                status_code=422,
                detail="Цель и прогресс измеримого плана не могут быть пустыми",
            )
        current_value = updates.get("current_value", item.current_value)
        target_value = updates.get("target_value", item.target_value)
        was_done = item.current_value >= item.target_value
        now_done = current_value >= target_value
        if was_done != now_done:
            item.done_at = datetime.now(timezone.utc) if now_done else None
    elif any(
        updates.get(field) is not None
        for field in ("target_value", "current_value", "unit")
    ):
        raise HTTPException(
            status_code=422,
            detail="Обычный план не поддерживает числовой прогресс",
        )
    for field, value in updates.items():
        setattr(item, field, value)
    if item.progress_type == "metric" and item.current_value >= item.target_value:
        item.done_at = item.done_at or datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return _item_out(item)


@router.delete("/{item_id}")
def delete_plan_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    item = _require_item(db, item_id)
    db.delete(item)
    db.commit()
    return {"message": "План удален"}
