import logging
from datetime import date, datetime, timezone
from typing import List, Optional, Sequence

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_admin_user, get_db
from app.models.marketing import (
    DEFAULT_QUARTER_BLOCKS,
    QUARTER_MAX_TASKS,
    QUARTER_SOFT_MAX,
    MarketingQuarter,
    MarketingQuarterBlock,
    MarketingQuarterReview,
    MarketingQuarterTask,
    add_months,
    quarter_end_of,
    quarter_months,
    quarter_start_of,
)
from app.models.user import User
from app.schemas.marketing_quarter import (
    QuarterBlockCreate,
    QuarterBlockOut,
    QuarterBlockUpdate,
    QuarterCreate,
    QuarterHistoryItem,
    QuarterOut,
    QuarterRetrospectiveUpdate,
    QuarterReviewOut,
    QuarterReviewUpsert,
    QuarterTaskCreate,
    QuarterTaskOut,
    QuarterTaskUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/marketing/quarters", tags=["admin-marketing"])

HISTORY_DEFAULT = 4
HISTORY_MAX = 12


def _load_options():
    return (
        selectinload(MarketingQuarter.blocks).selectinload(MarketingQuarterBlock.tasks),
        selectinload(MarketingQuarter.reviews),
    )


def _get_quarter(db: Session, starts_on: date) -> Optional[MarketingQuarter]:
    return (
        db.query(MarketingQuarter)
        .options(*_load_options())
        .filter(MarketingQuarter.starts_on == starts_on)
        .first()
    )


def _get_quarter_by_id(db: Session, quarter_id: int) -> MarketingQuarter:
    quarter = (
        db.query(MarketingQuarter)
        .options(*_load_options())
        .filter(MarketingQuarter.id == quarter_id)
        .first()
    )
    if quarter is None:
        raise HTTPException(status_code=404, detail="Квартал не найден")
    return quarter


def _require_saved(db: Session, on: date) -> MarketingQuarter:
    quarter = _get_quarter(db, quarter_start_of(on))
    if quarter is None:
        raise HTTPException(status_code=404, detail="Сначала составьте план на квартал")
    return quarter


def _require_block(db: Session, block_id: int) -> MarketingQuarterBlock:
    block = (
        db.query(MarketingQuarterBlock)
        .options(selectinload(MarketingQuarterBlock.tasks))
        .filter(MarketingQuarterBlock.id == block_id)
        .first()
    )
    if block is None:
        raise HTTPException(status_code=404, detail="Блок не найден")
    return block


def _require_task(db: Session, task_id: int) -> MarketingQuarterTask:
    task = (
        db.query(MarketingQuarterTask)
        .options(selectinload(MarketingQuarterTask.block))
        .filter(MarketingQuarterTask.id == task_id)
        .first()
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task


def _ordered(items: Sequence) -> list:
    return sorted(items, key=lambda item: (item.position, item.id))


def _resequence(items: Sequence) -> None:
    for index, item in enumerate(items, start=1):
        item.position = index


def _place(items: Sequence, item, position: int) -> None:
    ordered = [current for current in _ordered(items) if current.id != item.id]
    index = max(0, min(position - 1, len(ordered)))
    ordered.insert(index, item)
    _resequence(ordered)


def _blank(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _task_count(db: Session, quarter_id: int) -> int:
    return (
        db.query(func.count(MarketingQuarterTask.id))
        .join(MarketingQuarterBlock)
        .filter(MarketingQuarterBlock.quarter_id == quarter_id)
        .scalar()
    ) or 0


def _flat_tasks(quarter: MarketingQuarter) -> List[MarketingQuarterTask]:
    tasks: List[MarketingQuarterTask] = []
    for block in _ordered(quarter.blocks):
        tasks.extend(_ordered(block.tasks))
    return tasks


def _reviews_out(
    starts_on: date, quarter: Optional[MarketingQuarter]
) -> List[QuarterReviewOut]:
    stored = {}
    if quarter is not None:
        stored = {review.month_index: review.note or "" for review in quarter.reviews}
    months = quarter_months(starts_on)
    return [
        QuarterReviewOut(
            month_index=index,
            month_start=months[index - 1],
            note=stored.get(index, ""),
        )
        for index in range(1, len(months) + 1)
    ]


def _quarter_out(starts_on: date, quarter: Optional[MarketingQuarter]) -> QuarterOut:
    blocks = _ordered(quarter.blocks) if quarter is not None else []
    tasks = _flat_tasks(quarter) if quarter is not None else []
    return QuarterOut(
        starts_on=starts_on,
        ends_on=quarter_end_of(starts_on),
        exists=quarter is not None,
        blocks=[
            QuarterBlockOut(
                id=block.id,
                position=block.position,
                title=block.title,
                tasks=[
                    QuarterTaskOut(
                        id=task.id,
                        position=task.position,
                        title=task.title,
                        is_done=task.is_done,
                        done_at=task.done_at,
                    )
                    for task in _ordered(block.tasks)
                ],
            )
            for block in blocks
        ],
        reviews=_reviews_out(starts_on, quarter),
        retrospective=quarter.retrospective if quarter is not None else None,
        total=len(tasks),
        done=sum(1 for task in tasks if task.is_done),
        soft_max=QUARTER_SOFT_MAX,
        max_tasks=QUARTER_MAX_TASKS,
    )


def _history_item(
    starts_on: date, quarter: Optional[MarketingQuarter]
) -> QuarterHistoryItem:
    tasks = _flat_tasks(quarter) if quarter is not None else []
    total = len(tasks)
    done = sum(1 for task in tasks if task.is_done)
    retrospective = (quarter.retrospective or "").strip() if quarter is not None else ""
    return QuarterHistoryItem(
        starts_on=starts_on,
        ends_on=quarter_end_of(starts_on),
        exists=quarter is not None,
        total=total,
        done=done,
        needs_review=total > 0 and done < total and not retrospective,
    )


def _reload(db: Session, starts_on: date) -> QuarterOut:
    return _quarter_out(starts_on, _get_quarter(db, starts_on))


@router.get("", response_model=QuarterOut)
def get_quarter(
    on: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    starts_on = quarter_start_of(on or date.today())
    return _quarter_out(starts_on, _get_quarter(db, starts_on))


@router.get("/history", response_model=List[QuarterHistoryItem])
def get_quarter_history(
    limit: int = Query(HISTORY_DEFAULT, ge=1, le=HISTORY_MAX),
    anchor: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[QuarterHistoryItem]:
    end = quarter_start_of(anchor or date.today())
    start = add_months(end, -3 * (limit - 1))
    stored = (
        db.query(MarketingQuarter)
        .options(*_load_options())
        .filter(MarketingQuarter.starts_on >= start, MarketingQuarter.starts_on <= end)
        .all()
    )
    by_start = {item.starts_on: item for item in stored}
    history: List[QuarterHistoryItem] = []
    cursor = start
    while cursor <= end:
        history.append(_history_item(cursor, by_start.get(cursor)))
        cursor = add_months(cursor, 3)
    return history


@router.post("", response_model=QuarterOut)
def create_quarter(
    payload: QuarterCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    starts_on = quarter_start_of(payload.on)
    existing = _get_quarter(db, starts_on)
    if existing is not None:
        return _quarter_out(starts_on, existing)

    quarter = MarketingQuarter(starts_on=starts_on)
    db.add(quarter)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        logger.warning("quarter already exists", extra={"starts_on": str(starts_on)})
        existing = _get_quarter(db, starts_on)
        if existing is None:
            raise
        return _quarter_out(starts_on, existing)

    for index, title in enumerate(DEFAULT_QUARTER_BLOCKS, start=1):
        db.add(
            MarketingQuarterBlock(quarter_id=quarter.id, title=title, position=index)
        )
    db.commit()
    return _reload(db, starts_on)


@router.post("/blocks", response_model=QuarterOut)
def create_block(
    payload: QuarterBlockCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    quarter = _require_saved(db, payload.on)
    last = max((block.position for block in quarter.blocks), default=0)
    db.add(
        MarketingQuarterBlock(
            quarter_id=quarter.id,
            title=payload.title.strip(),
            position=last + 1,
        )
    )
    db.commit()
    return _reload(db, quarter.starts_on)


@router.patch("/blocks/{block_id}", response_model=QuarterOut)
def update_block(
    block_id: int,
    payload: QuarterBlockUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Нет изменений")
    block = _require_block(db, block_id)
    quarter = _get_quarter_by_id(db, block.quarter_id)
    if "title" in changes and changes["title"] is not None:
        block.title = changes["title"].strip()
    if "position" in changes and changes["position"] is not None:
        _place(quarter.blocks, block, changes["position"])
    db.commit()
    return _reload(db, quarter.starts_on)


@router.delete("/blocks/{block_id}", response_model=QuarterOut)
def delete_block(
    block_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    block = _require_block(db, block_id)
    quarter = _get_quarter_by_id(db, block.quarter_id)
    starts_on = quarter.starts_on
    survivors = [item for item in _ordered(quarter.blocks) if item.id != block.id]
    db.delete(block)
    _resequence(survivors)
    db.commit()
    return _reload(db, starts_on)


def _ensure_capacity(db: Session, quarter_id: int) -> None:
    if _task_count(db, quarter_id) >= QUARTER_MAX_TASKS:
        raise HTTPException(
            status_code=400,
            detail="В плане «90 дней» не больше 40 задач, иначе он перестаёт выполняться",
        )


@router.post("/tasks", response_model=QuarterOut)
def create_task(
    payload: QuarterTaskCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    block = _require_block(db, payload.block_id)
    _ensure_capacity(db, block.quarter_id)
    last = max((task.position for task in block.tasks), default=0)
    db.add(
        MarketingQuarterTask(
            block_id=block.id,
            position=last + 1,
            title=payload.title.strip(),
        )
    )
    db.commit()
    quarter = _get_quarter_by_id(db, block.quarter_id)
    return _quarter_out(quarter.starts_on, quarter)


def _apply_done(task: MarketingQuarterTask, is_done: bool) -> None:
    task.is_done = is_done
    task.done_at = datetime.now(timezone.utc) if is_done else None


def _move_task(
    db: Session,
    task: MarketingQuarterTask,
    block_id: Optional[int],
    position: Optional[int],
) -> None:
    source = task.block
    destination_id = block_id if block_id is not None else source.id
    if destination_id != source.id:
        destination = _require_block(db, destination_id)
        if destination.quarter_id != source.quarter_id:
            raise HTTPException(status_code=400, detail="Блок из другого квартала")
        task.block_id = destination.id
        task.position = QUARTER_MAX_TASKS + 1
        db.flush()
        _resequence(
            db.query(MarketingQuarterTask)
            .filter(
                MarketingQuarterTask.block_id == source.id,
                MarketingQuarterTask.id != task.id,
            )
            .order_by(MarketingQuarterTask.position, MarketingQuarterTask.id)
            .all()
        )
        source = destination

    tasks = (
        db.query(MarketingQuarterTask)
        .filter(MarketingQuarterTask.block_id == source.id)
        .order_by(MarketingQuarterTask.position, MarketingQuarterTask.id)
        .all()
    )
    if position is None:
        _resequence(tasks)
        return
    _place(tasks, task, position)


@router.patch("/tasks/{task_id}", response_model=QuarterOut)
def update_task(
    task_id: int,
    payload: QuarterTaskUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Нет изменений")
    task = _require_task(db, task_id)
    if "title" in changes and changes["title"] is not None:
        task.title = changes["title"].strip()
    if "is_done" in changes and changes["is_done"] is not None:
        _apply_done(task, changes["is_done"])
    if "block_id" in changes or "position" in changes:
        _move_task(db, task, changes.get("block_id"), changes.get("position"))
    quarter_id = task.block.quarter_id
    db.commit()
    quarter = _get_quarter_by_id(db, quarter_id)
    return _quarter_out(quarter.starts_on, quarter)


@router.delete("/tasks/{task_id}", response_model=QuarterOut)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    task = _require_task(db, task_id)
    block = task.block
    quarter_id = block.quarter_id
    survivors = [item for item in _ordered(block.tasks) if item.id != task.id]
    db.delete(task)
    _resequence(survivors)
    db.commit()
    quarter = _get_quarter_by_id(db, quarter_id)
    return _quarter_out(quarter.starts_on, quarter)


@router.put("/reviews", response_model=QuarterOut)
def upsert_review(
    payload: QuarterReviewUpsert,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    quarter = _require_saved(db, payload.on)
    review = next(
        (item for item in quarter.reviews if item.month_index == payload.month_index),
        None,
    )
    note = _blank(payload.note)
    if review is None:
        db.add(
            MarketingQuarterReview(
                quarter_id=quarter.id,
                month_index=payload.month_index,
                note=note,
            )
        )
    else:
        review.note = note
    db.commit()
    return _reload(db, quarter.starts_on)


@router.patch("", response_model=QuarterOut)
def update_retrospective(
    payload: QuarterRetrospectiveUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> QuarterOut:
    quarter = _require_saved(db, payload.on)
    quarter.retrospective = _blank(payload.retrospective)
    db.commit()
    return _reload(db, quarter.starts_on)
