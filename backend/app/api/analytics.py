from collections import defaultdict
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from statistics import median
from typing import Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.calendar_appointment import (
    AppointmentStatus,
    AppointmentType,
    CalendarAppointment,
    ClientSource,
    DURATION_HOURS,
)

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


def _parse_period(
    date_from: Optional[datetime],
    date_to: Optional[datetime],
) -> Tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    end = date_to or now
    start = date_from or (end - timedelta(days=30))
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    return start, end


def _previous_period(start: datetime, end: datetime) -> Tuple[datetime, datetime]:
    length = end - start
    return start - length, start


def _appointments_in_range(
    db: Session, start: datetime, end: datetime
) -> List[CalendarAppointment]:
    return (
        db.query(CalendarAppointment)
        .filter(
            CalendarAppointment.starts_at >= start,
            CalendarAppointment.starts_at <= end,
        )
        .all()
    )


def _money(value) -> float:
    if value is None:
        return 0.0
    return float(Decimal(value))


def _source_label(source: ClientSource) -> str:
    labels = {
        ClientSource.instagram: "Instagram",
        ClientSource.profi: "Profi",
        ClientSource.website: "сайт",
        ClientSource.referral: "рекомендация",
        ClientSource.returning: "повторный клиент",
        ClientSource.other: "другое",
    }
    return labels.get(source, source.value)


def _type_label(appointment_type: AppointmentType) -> str:
    labels = {
        AppointmentType.hair: "Прическа",
        AppointmentType.makeup: "Макияж",
        AppointmentType.look: "Образ",
        AppointmentType.trial_look: "Пробный образ",
        AppointmentType.wedding_look: "Свадебный образ",
        AppointmentType.self_makeup: "Макияж для себя",
    }
    return labels.get(appointment_type, appointment_type.value)


@router.get("/overview")
def analytics_overview(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    items = _appointments_in_range(db, start, end)

    completed = [a for a in items if a.status == AppointmentStatus.completed]
    cancelled = [a for a in items if a.status == AppointmentStatus.cancelled]
    no_show = [a for a in items if a.status == AppointmentStatus.no_show]
    scheduled = [a for a in items if a.status == AppointmentStatus.scheduled]
    with_prepay = [a for a in items if a.has_prepayment]

    revenue = sum(_money(a.price) for a in completed)
    avg_check = revenue / len(completed) if completed else 0.0

    source_counts: Dict[ClientSource, int] = defaultdict(int)
    for a in items:
        source_counts[a.client_source] += 1
    top_source = None
    if source_counts:
        top = max(source_counts.items(), key=lambda x: x[1])
        top_source = {"source": top[0].value, "label": _source_label(top[0]), "count": top[1]}

    by_day: Dict[str, int] = defaultdict(int)
    for a in items:
        key = a.starts_at.astimezone(timezone.utc).date().isoformat()
        by_day[key] += 1
    timeline = [{"date": d, "count": by_day[d]} for d in sorted(by_day.keys())]

    return {
        "period": {"from": start, "to": end},
        "total": len(items),
        "completed": len(completed),
        "cancelled": len(cancelled),
        "no_show": len(no_show),
        "scheduled": len(scheduled),
        "revenue": revenue,
        "average_check": round(avg_check, 2),
        "prepayment_share": round(len(with_prepay) / len(items) * 100, 1) if items else 0.0,
        "top_source": top_source,
        "timeline": timeline,
    }


@router.get("/sources")
def analytics_sources(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    prev_start, prev_end = _previous_period(start, end)
    current = _appointments_in_range(db, start, end)
    previous = _appointments_in_range(db, prev_start, prev_end)

    def aggregate(items: List[CalendarAppointment]):
        counts: Dict[ClientSource, int] = defaultdict(int)
        for a in items:
            counts[a.client_source] += 1
        total = len(items) or 1
        rows = []
        for source in ClientSource:
            count = counts.get(source, 0)
            rows.append(
                {
                    "source": source.value,
                    "label": _source_label(source),
                    "count": count,
                    "share": round(count / total * 100, 1) if items else 0.0,
                }
            )
        return rows

    current_rows = aggregate(current)
    prev_map = {r["source"]: r["count"] for r in aggregate(previous)}
    for row in current_rows:
        prev_count = prev_map.get(row["source"], 0)
        row["previous_count"] = prev_count
        if prev_count == 0:
            row["change_pct"] = 100.0 if row["count"] > 0 else 0.0
        else:
            row["change_pct"] = round((row["count"] - prev_count) / prev_count * 100, 1)

    other_details: Dict[str, int] = defaultdict(int)
    for a in current:
        if a.client_source == ClientSource.other and a.client_source_other:
            other_details[a.client_source_other.strip()] += 1

    return {
        "period": {"from": start, "to": end},
        "previous_period": {"from": prev_start, "to": prev_end},
        "total": len(current),
        "sources": current_rows,
        "other_breakdown": [
            {"label": k, "count": v} for k, v in sorted(other_details.items(), key=lambda x: -x[1])
        ],
    }


@router.get("/funnel")
def analytics_funnel(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    items = _appointments_in_range(db, start, end)

    scheduled = [a for a in items if a.status == AppointmentStatus.scheduled]
    completed = [a for a in items if a.status == AppointmentStatus.completed]
    cancelled = [a for a in items if a.status == AppointmentStatus.cancelled]
    no_show = [a for a in items if a.status == AppointmentStatus.no_show]
    resolved = completed + cancelled + no_show

    conversion = (
        round(len(completed) / len(resolved) * 100, 1) if resolved else 0.0
    )
    cancel_rate = (
        round(len(cancelled) / len(resolved) * 100, 1) if resolved else 0.0
    )
    no_show_rate = (
        round(len(no_show) / len(resolved) * 100, 1) if resolved else 0.0
    )

    return {
        "period": {"from": start, "to": end},
        "total": len(items),
        "awaiting": len(scheduled),
        "resolved": len(resolved),
        "stages": [
            {"status": "scheduled", "label": "Запланировано", "count": len(scheduled)},
            {"status": "completed", "label": "Завершено", "count": len(completed)},
            {"status": "cancelled", "label": "Отменено", "count": len(cancelled)},
            {"status": "no_show", "label": "Не пришли", "count": len(no_show)},
        ],
        "conversion_to_visit": conversion,
        "cancel_rate": cancel_rate,
        "no_show_rate": no_show_rate,
    }


@router.get("/quality")
def analytics_quality(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    items = _appointments_in_range(db, start, end)

    by_source: Dict[ClientSource, List[CalendarAppointment]] = defaultdict(list)
    for a in items:
        by_source[a.client_source].append(a)

    rows = []
    for source in ClientSource:
        group = by_source.get(source, [])
        completed = [a for a in group if a.status == AppointmentStatus.completed]
        no_show = [a for a in group if a.status == AppointmentStatus.no_show]
        resolved = [
            a
            for a in group
            if a.status
            in (
                AppointmentStatus.completed,
                AppointmentStatus.cancelled,
                AppointmentStatus.no_show,
            )
        ]
        revenue = sum(_money(a.price) for a in completed)
        rows.append(
            {
                "source": source.value,
                "label": _source_label(source),
                "count": len(group),
                "completed_share": round(len(completed) / len(resolved) * 100, 1)
                if resolved
                else 0.0,
                "revenue": revenue,
                "average_check": round(revenue / len(completed), 2) if completed else 0.0,
                "no_show_share": round(len(no_show) / len(resolved) * 100, 1)
                if resolved
                else 0.0,
            }
        )

    by_revenue = sorted(rows, key=lambda r: r["revenue"], reverse=True)
    by_conversion = sorted(rows, key=lambda r: r["completed_share"], reverse=True)

    return {
        "period": {"from": start, "to": end},
        "by_source": rows,
        "ranking_by_revenue": by_revenue,
        "ranking_by_conversion": by_conversion,
    }


@router.get("/revenue")
def analytics_revenue(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    include_scheduled: bool = Query(False),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    items = _appointments_in_range(db, start, end)

    statuses = {AppointmentStatus.completed}
    if include_scheduled:
        statuses.add(AppointmentStatus.scheduled)
    relevant = [a for a in items if a.status in statuses]

    prices = [_money(a.price) for a in relevant]
    total_revenue = sum(prices)
    prepayments = sum(
        _money(a.prepayment_amount) for a in relevant if a.has_prepayment and a.prepayment_amount
    )
    remaining = total_revenue - prepayments
    avg_check = total_revenue / len(relevant) if relevant else 0.0
    median_check = float(median(prices)) if prices else 0.0

    by_day: Dict[str, float] = defaultdict(float)
    for a in relevant:
        key = a.starts_at.astimezone(timezone.utc).date().isoformat()
        by_day[key] += _money(a.price)

    return {
        "period": {"from": start, "to": end},
        "include_scheduled": include_scheduled,
        "count": len(relevant),
        "total_revenue": round(total_revenue, 2),
        "prepayments_total": round(prepayments, 2),
        "remaining_to_pay": round(remaining, 2),
        "average_check": round(avg_check, 2),
        "median_check": round(median_check, 2),
        "by_day": [{"date": d, "revenue": round(by_day[d], 2)} for d in sorted(by_day.keys())],
    }


@router.get("/services")
def analytics_services(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    items = _appointments_in_range(db, start, end)

    by_type: Dict[AppointmentType, List[CalendarAppointment]] = defaultdict(list)
    for a in items:
        by_type[a.appointment_type].append(a)

    rows = []
    total_hours = 0.0
    for appointment_type in AppointmentType:
        group = by_type.get(appointment_type, [])
        active = [
            a
            for a in group
            if a.status in (AppointmentStatus.completed, AppointmentStatus.scheduled)
        ]
        completed = [a for a in group if a.status == AppointmentStatus.completed]
        duration = DURATION_HOURS[appointment_type]
        hours = len(active) * duration
        total_hours += hours
        revenue = sum(_money(a.price) for a in completed)
        rows.append(
            {
                "type": appointment_type.value,
                "label": _type_label(appointment_type),
                "count": len(group),
                "active_count": len(active),
                "revenue": round(revenue, 2),
                "duration_hours": duration,
                "busy_hours": round(hours, 2),
            }
        )

    return {
        "period": {"from": start, "to": end},
        "services": rows,
        "total_busy_hours": round(total_hours, 2),
    }


@router.get("/timeline")
def analytics_timeline(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    granularity: str = Query("day", pattern="^(day|week)$"),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    start, end = _parse_period(date_from, date_to)
    items = _appointments_in_range(db, start, end)

    buckets: Dict[str, Dict[str, float]] = defaultdict(
        lambda: {"count": 0, "revenue": 0.0, "completed": 0}
    )

    for a in items:
        dt = a.starts_at.astimezone(timezone.utc)
        if granularity == "week":
            week_start = (dt - timedelta(days=dt.weekday())).date()
            key = week_start.isoformat()
        else:
            key = dt.date().isoformat()
        buckets[key]["count"] += 1
        if a.status == AppointmentStatus.completed:
            buckets[key]["completed"] += 1
            buckets[key]["revenue"] += _money(a.price)

    points = [
        {
            "date": d,
            "count": int(buckets[d]["count"]),
            "completed": int(buckets[d]["completed"]),
            "revenue": round(buckets[d]["revenue"], 2),
        }
        for d in sorted(buckets.keys())
    ]

    return {
        "period": {"from": start, "to": end},
        "granularity": granularity,
        "points": points,
    }
