import logging
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_admin_user, get_db
from app.models.marketing import (
    TOP5_MAX_TASKS,
    TOP5_MIN_TASKS,
    MarketingTop5Task,
    MarketingTop5Week,
    friday_of,
    monday_of,
)
from app.models.user import User
from app.schemas.marketing import (
    Top5HistoryItem,
    Top5TaskCreate,
    Top5TaskOut,
    Top5TaskUpdate,
    Top5WeekOut,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/marketing/top5", tags=["admin-marketing"])

HISTORY_WEEKS_DEFAULT = 12
HISTORY_WEEKS_MAX = 26


def _get_week(db: Session, week_start: date) -> Optional[MarketingTop5Week]:
    return (
        db.query(MarketingTop5Week)
        .options(selectinload(MarketingTop5Week.tasks))
        .filter(MarketingTop5Week.week_start == week_start)
        .first()
    )


def _ordered_tasks(week: MarketingTop5Week) -> List[MarketingTop5Task]:
    return sorted(week.tasks, key=lambda task: (task.position, task.id))


def _resequence(tasks: List[MarketingTop5Task]) -> None:
    for index, task in enumerate(tasks, start=1):
        task.position = index


def _blank_to_none(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _task_out(task: MarketingTop5Task) -> Top5TaskOut:
    return Top5TaskOut(
        id=task.id,
        position=task.position,
        title=task.title,
        owner=task.owner,
        weekday=task.weekday,
        is_done=task.is_done,
        done_at=task.done_at,
    )


def _week_out(week_start: date, week: Optional[MarketingTop5Week]) -> Top5WeekOut:
    tasks = _ordered_tasks(week) if week is not None else []
    return Top5WeekOut(
        week_start=week_start,
        week_end=friday_of(week_start),
        tasks=[_task_out(task) for task in tasks],
        total=len(tasks),
        done=sum(1 for task in tasks if task.is_done),
        min_tasks=TOP5_MIN_TASKS,
        max_tasks=TOP5_MAX_TASKS,
    )


def _require_task(db: Session, task_id: int) -> MarketingTop5Task:
    task = db.query(MarketingTop5Task).filter(MarketingTop5Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task


def _get_or_create_week(db: Session, week_start: date) -> MarketingTop5Week:
    existing = _get_week(db, week_start)
    if existing is not None:
        return existing

    week = MarketingTop5Week(week_start=week_start)
    db.add(week)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        logger.warning(
            "top5 week already exists", extra={"week_start": str(week_start)}
        )
        existing = _get_week(db, week_start)
        if existing is None:
            raise
        return existing
    return week


def _place_task(
    tasks: List[MarketingTop5Task], task: MarketingTop5Task, position: int
) -> None:
    ordered = [item for item in tasks if item.id != task.id]
    index = max(0, min(position - 1, len(ordered)))
    ordered.insert(index, task)
    _resequence(ordered)


def _apply_done(task: MarketingTop5Task, is_done: bool) -> None:
    task.is_done = is_done
    task.done_at = datetime.now(timezone.utc) if is_done else None


@router.get("", response_model=Top5WeekOut)
def get_top5_week(
    week: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> Top5WeekOut:
    week_start = monday_of(week or date.today())
    return _week_out(week_start, _get_week(db, week_start))


@router.get("/history", response_model=List[Top5HistoryItem])
def get_top5_history(
    weeks: int = Query(HISTORY_WEEKS_DEFAULT, ge=1, le=HISTORY_WEEKS_MAX),
    anchor: Optional[date] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> List[Top5HistoryItem]:
    end = monday_of(anchor or date.today())
    start = end - timedelta(weeks=weeks - 1)
    stored = (
        db.query(MarketingTop5Week)
        .options(selectinload(MarketingTop5Week.tasks))
        .filter(
            MarketingTop5Week.week_start >= start, MarketingTop5Week.week_start <= end
        )
        .all()
    )
    by_week = {item.week_start: item for item in stored}
    history: List[Top5HistoryItem] = []
    cursor = start
    while cursor <= end:
        week = by_week.get(cursor)
        tasks = week.tasks if week is not None else []
        history.append(
            Top5HistoryItem(
                week_start=cursor,
                week_end=friday_of(cursor),
                total=len(tasks),
                done=sum(1 for task in tasks if task.is_done),
            )
        )
        cursor += timedelta(weeks=1)
    return history


@router.post("/tasks", response_model=Top5WeekOut)
def create_top5_task(
    payload: Top5TaskCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> Top5WeekOut:
    week_start = monday_of(payload.week)
    week = _get_or_create_week(db, week_start)
    task_count = (
        db.query(func.count(MarketingTop5Task.id))
        .filter(MarketingTop5Task.week_id == week.id)
        .scalar()
    )
    if task_count >= TOP5_MAX_TASKS:
        raise HTTPException(
            status_code=400,
            detail="В Топ-5 не больше 7 задач: иначе неделя перестаёт быть выполнимой",
        )

    last_position = (
        db.query(func.max(MarketingTop5Task.position))
        .filter(MarketingTop5Task.week_id == week.id)
        .scalar()
    )
    task = MarketingTop5Task(
        week_id=week.id,
        position=(last_position or 0) + 1,
        title=payload.title.strip(),
        owner=_blank_to_none(payload.owner),
        weekday=payload.weekday,
    )
    db.add(task)
    db.commit()
    return _week_out(week_start, _get_week(db, week_start))


def _get_week_by_id(db: Session, week_id: int) -> MarketingTop5Week:
    week = (
        db.query(MarketingTop5Week)
        .options(selectinload(MarketingTop5Week.tasks))
        .filter(MarketingTop5Week.id == week_id)
        .first()
    )
    if week is None:
        raise HTTPException(status_code=404, detail="Неделя не найдена")
    return week


@router.patch("/tasks/{task_id}", response_model=Top5WeekOut)
def update_top5_task(
    task_id: int,
    payload: Top5TaskUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> Top5WeekOut:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Нет изменений")

    task = _require_task(db, task_id)
    week = _get_week_by_id(db, task.week_id)
    if "title" in changes and changes["title"] is not None:
        task.title = changes["title"].strip()
    if "owner" in changes:
        task.owner = _blank_to_none(changes["owner"])
    if "weekday" in changes:
        task.weekday = changes["weekday"]
    if "is_done" in changes and changes["is_done"] is not None:
        _apply_done(task, changes["is_done"])
    if "position" in changes and changes["position"] is not None:
        _place_task(_ordered_tasks(week), task, changes["position"])

    db.commit()
    return _week_out(week.week_start, _get_week(db, week.week_start))


@router.delete("/tasks/{task_id}", response_model=Top5WeekOut)
def delete_top5_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> Top5WeekOut:
    task = _require_task(db, task_id)
    week = _get_week_by_id(db, task.week_id)
    week_start = week.week_start
    survivors = [item for item in _ordered_tasks(week) if item.id != task.id]
    db.delete(task)
    if survivors:
        _resequence(survivors)
    else:
        db.delete(week)
    db.commit()
    return _week_out(week_start, _get_week(db, week_start))
