from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.calendar_appointment import CalendarAppointment, ClientSource
from app.models.traffic_source import MarketingTrafficMetric
from app.models.user import User
from app.schemas.traffic_source import (
    TrafficMetricUpdate,
    TrafficMonthOut,
    TrafficSource,
    TrafficYearOut,
)

router = APIRouter(
    prefix="/admin/marketing/traffic-sources",
    tags=["admin-marketing"],
)

SOURCE_FIELDS = {
    "profi_ru": {
        "ad_spend",
        "subscription_cost",
        "subscription_active",
    },
    "instagram": {"followers_count", "reels_count", "initiatives"},
    "pinterest": {"views_count", "pins_count"},
}
PINTEREST_LABELS = {"pinterest", "пинтерест", "пинтерест (pinterest)"}


def _month_applications(db: Session, year: int) -> Dict[tuple, int]:
    start = datetime(year, 1, 1, tzinfo=timezone.utc)
    end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    appointments = (
        db.query(CalendarAppointment)
        .filter(
            CalendarAppointment.starts_at >= start,
            CalendarAppointment.starts_at < end,
        )
        .all()
    )
    counts = defaultdict(int)
    for appointment in appointments:
        month = appointment.starts_at.astimezone(timezone.utc).month
        if appointment.client_source == ClientSource.profi:
            source = "profi_ru"
        elif appointment.client_source == ClientSource.instagram:
            source = "instagram"
        elif (
            appointment.client_source == ClientSource.other
            and (appointment.client_source_other or "").strip().casefold()
            in PINTEREST_LABELS
        ):
            source = "pinterest"
        else:
            continue
        counts[(source, month)] += 1
    return counts


def _month_out(
    source: str,
    month: int,
    item: MarketingTrafficMetric | None,
    applications: int,
    previous_followers: int | None,
) -> TrafficMonthOut:
    growth = None
    if (
        source == "instagram"
        and item is not None
        and item.followers_count is not None
        and previous_followers is not None
        and previous_followers > 0
    ):
        growth = round(
            (item.followers_count - previous_followers) / previous_followers * 100,
            1,
        )
    return TrafficMonthOut(
        month=month,
        applications=applications,
        follower_growth_pct=growth,
        ad_spend=item.ad_spend if item else None,
        subscription_cost=item.subscription_cost if item else None,
        subscription_active=(
            bool(item.subscription_active)
            if item and item.subscription_active is not None
            else None
        ),
        followers_count=item.followers_count if item else None,
        reels_count=item.reels_count if item else None,
        initiatives=item.initiatives if item else None,
        views_count=item.views_count if item else None,
        pins_count=item.pins_count if item else None,
    )


@router.get("/{year}", response_model=TrafficYearOut)
def get_traffic_metrics(
    year: int = Path(..., ge=2000, le=2200),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    items = (
        db.query(MarketingTrafficMetric)
        .filter(MarketingTrafficMetric.year.in_([year - 1, year]))
        .all()
    )
    by_period = {
        (item.source, item.year, item.month): item
        for item in items
    }
    applications = _month_applications(db, year)
    sources: Dict[str, List[TrafficMonthOut]] = {}

    for source in SOURCE_FIELDS:
        months = []
        for month in range(1, 13):
            item = by_period.get((source, year, month))
            previous_year, previous_month = (
                (year - 1, 12) if month == 1 else (year, month - 1)
            )
            previous = by_period.get((source, previous_year, previous_month))
            months.append(
                _month_out(
                    source,
                    month,
                    item,
                    applications.get((source, month), 0),
                    previous.followers_count if previous else None,
                )
            )
        sources[source] = months

    return TrafficYearOut(year=year, sources=sources)


@router.put("/{source}/{year}/{month}", response_model=TrafficMonthOut)
def save_traffic_metrics(
    payload: TrafficMetricUpdate,
    source: TrafficSource = Path(...),
    year: int = Path(..., ge=2000, le=2200),
    month: int = Path(..., ge=1, le=12),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    values = payload.model_dump(exclude_unset=True)
    allowed_fields = SOURCE_FIELDS[source]
    invalid_fields = [
        field for field, value in values.items() if field not in allowed_fields and value is not None
    ]
    if invalid_fields:
        raise HTTPException(
            status_code=422,
            detail=f"Эти показатели не относятся к источнику {source}: "
            + ", ".join(invalid_fields),
        )

    missing_fields = [
        field
        for field in allowed_fields - ({"initiatives"} if source == "instagram" else set())
        if field not in values or values[field] is None
    ]
    if missing_fields:
        raise HTTPException(
            status_code=422,
            detail="Заполните обязательные показатели: " + ", ".join(sorted(missing_fields)),
        )

    item = (
        db.query(MarketingTrafficMetric)
        .filter_by(source=source, year=year, month=month)
        .first()
    )
    if item is None:
        item = MarketingTrafficMetric(source=source, year=year, month=month)
        db.add(item)
    for field, value in values.items():
        if field in allowed_fields:
            setattr(item, field, value)
    db.commit()
    db.refresh(item)

    applications = _month_applications(db, year).get((source, month), 0)
    previous_year, previous_month = (
        (year - 1, 12) if month == 1 else (year, month - 1)
    )
    previous = (
        db.query(MarketingTrafficMetric)
        .filter_by(source=source, year=previous_year, month=previous_month)
        .first()
    )
    return _month_out(
        source,
        month,
        item,
        applications,
        previous.followers_count if previous else None,
    )
