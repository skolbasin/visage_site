import logging
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Sequence, Tuple

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.api.expenses import _materialize_recurring
from app.core.config import settings
from app.models.calendar_appointment import (
    AppointmentStatus,
    AppointmentType,
    CalendarAppointment,
)
from app.models.digest import DigestDispatch
from app.models.expense import Expense, ExpensePayer
from app.models.marketing import (
    MarketingQuarter,
    MarketingQuarterBlock,
    MarketingTop5Task,
    MarketingTop5Week,
    monday_of,
    quarter_start_of,
)
from app.services.admin_recipients import AdminContact, AdminKey, admin_contacts
from app.services.email_service import send_digest_email
from app.services.moscow_time import MOSCOW_TZ

logger = logging.getLogger(__name__)

_SERGEY_OWNERS = {"сергей", "сережа", "sereja", "sergey", "sergei"}
_NASTYA_OWNERS = {"анастасия", "настя", "nastya", "anastasia", "nastia"}
_PAYER_BY_ADMIN = {
    AdminKey.sereja: ExpensePayer.sereja,
    AdminKey.nastya: ExpensePayer.nastya,
}
_TYPE_LABELS = {
    AppointmentType.hair: "Прическа",
    AppointmentType.makeup: "Макияж",
    AppointmentType.look: "Образ",
    AppointmentType.trial_look: "Пробный образ",
    AppointmentType.wedding_look: "Свадебный образ",
    AppointmentType.self_makeup: "Макияж для себя",
}


@dataclass(frozen=True)
class DigestSection:
    title: str
    text: str
    items: Tuple[str, ...]
    link: str
    link_label: str


@dataclass(frozen=True)
class DigestReport:
    recipient: AdminContact
    sections: Tuple[DigestSection, ...]


def collect_reports(db: Session, today: date) -> List[DigestReport]:
    contacts = admin_contacts()
    if not contacts:
        return []
    buckets: Dict[AdminKey, List[DigestSection]] = {
        contact.key: [] for contact in contacts
    }
    _collect_expenses(db, today, buckets)
    _collect_calendar(db, today, buckets)
    _collect_top5(db, today, buckets)
    _collect_quarter(db, today, buckets)
    return _reports_from_buckets(contacts, buckets)


def run_daily_digest(db: Session, today: Optional[date] = None) -> List[str]:
    """Письмо каждому, у кого есть секции. Пустой отчёт не отправляется."""
    report_day = today or moscow_today()
    reports = collect_reports(db, report_day)
    if not reports:
        logger.info("утренний отчёт %s: нечего отправлять", report_day.isoformat())
        return []

    sent: List[str] = []
    formatted = report_day.strftime("%d.%m.%Y")
    for report in reports:
        name = report.recipient.name
        sections = ", ".join(section.title for section in report.sections)
        if _was_sent(db, report_day, report.recipient.email):
            logger.info("утренний отчёт %s: %s уже отправлен", report_day.isoformat(), name)
            continue
        delivered = send_digest_email(
            to=report.recipient.email,
            name=name,
            report_date=formatted,
            sections=report.sections,
        )
        if not delivered:
            logger.warning(
                "утренний отчёт %s: %s не отправлен, разделы: %s",
                report_day.isoformat(),
                name,
                sections,
            )
            continue
        _mark_sent(db, report_day, report.recipient.email)
        sent.append(report.recipient.email)
        logger.info(
            "утренний отчёт %s: %s отправлен, разделы: %s",
            report_day.isoformat(),
            name,
            sections,
        )
    return sent


def moscow_today() -> date:
    return datetime.now(MOSCOW_TZ).date()


def _reports_from_buckets(
    contacts: Sequence[AdminContact],
    buckets: Dict[AdminKey, List[DigestSection]],
) -> List[DigestReport]:
    reports: List[DigestReport] = []
    for contact in contacts:
        sections = buckets.get(contact.key) or []
        if not sections:
            continue
        reports.append(DigestReport(recipient=contact, sections=tuple(sections)))
    return reports


def _collect_expenses(
    db: Session,
    today: date,
    buckets: Dict[AdminKey, List[DigestSection]],
) -> None:
    yesterday = today - timedelta(days=1)
    _materialize_recurring(db, yesterday, yesterday)
    text = (
        "Расходы за {day} — 0. Либо вы вчера ничего не тратили, "
        "либо забыли заполнить."
    ).format(day=yesterday.strftime("%d.%m.%Y"))
    section = DigestSection(
        title="Расходы",
        text=text,
        items=tuple(),
        link=_admin_url("/admin/expenses"),
        link_label="Открыть расходы",
    )
    for key in buckets:
        payer = _PAYER_BY_ADMIN[key]
        if _has_expense(db, yesterday, payer):
            continue
        buckets[key].append(section)


def _has_expense(db: Session, spent_on: date, payer: ExpensePayer) -> bool:
    row = (
        db.query(Expense.id)
        .filter(
            Expense.deleted_at.is_(None),
            Expense.spent_on == spent_on,
            Expense.paid_by == payer,
        )
        .first()
    )
    return row is not None


def _collect_calendar(
    db: Session,
    today: date,
    buckets: Dict[AdminKey, List[DigestSection]],
) -> None:
    if AdminKey.nastya not in buckets:
        return
    items = _past_scheduled(db, today)
    if not items:
        return
    buckets[AdminKey.nastya].append(
        DigestSection(
            title="Календарь",
            text="Нужно изменить статус у записей, которые всё ещё «Запланировано».",
            items=tuple(items),
            link=_admin_url("/admin/calendar"),
            link_label="Открыть календарь",
        )
    )


def _past_scheduled(db: Session, today: date) -> List[str]:
    rows = (
        db.query(CalendarAppointment)
        .filter(CalendarAppointment.status == AppointmentStatus.scheduled)
        .order_by(CalendarAppointment.starts_at)
        .all()
    )
    lines: List[str] = []
    for row in rows:
        local = _as_moscow(row.starts_at)
        if local.date() >= today:
            continue
        lines.append(
            "{name} · {kind} · {when}".format(
                name=row.name,
                kind=_type_label(row.appointment_type),
                when=local.strftime("%d.%m.%Y %H:%M"),
            )
        )
    return lines


def _collect_top5(
    db: Session,
    today: date,
    buckets: Dict[AdminKey, List[DigestSection]],
) -> None:
    monday = monday_of(today)
    tasks = (
        db.query(MarketingTop5Task)
        .options(joinedload(MarketingTop5Task.week))
        .join(MarketingTop5Week)
        .filter(
            MarketingTop5Week.week_start <= monday,
            MarketingTop5Task.is_done.is_(False),
        )
        .order_by(MarketingTop5Week.week_start, MarketingTop5Task.position)
        .all()
    )
    grouped: Dict[AdminKey, List[str]] = {key: [] for key in buckets}
    for task in tasks:
        line = _top5_line(task)
        for key in _owner_keys(task.owner):
            if key in grouped:
                grouped[key].append(line)
    section_base = dict(
        title="Маркетинг · Топ-5",
        text="Есть незакрытые задачи.",
        link=_admin_url("/admin/marketing/top-5"),
        link_label="Открыть Топ-5",
    )
    for key, lines in grouped.items():
        if not lines:
            continue
        buckets[key].append(DigestSection(items=tuple(lines), **section_base))


def _collect_quarter(
    db: Session,
    today: date,
    buckets: Dict[AdminKey, List[DigestSection]],
) -> None:
    if not _is_last_day_of_month(today):
        return
    quarter = (
        db.query(MarketingQuarter)
        .options(
            selectinload(MarketingQuarter.blocks).selectinload(
                MarketingQuarterBlock.tasks
            )
        )
        .filter(MarketingQuarter.starts_on == quarter_start_of(today))
        .first()
    )
    if quarter is None:
        return
    open_tasks, total = _open_quarter_tasks(quarter)
    if not open_tasks:
        return
    done = total - len(open_tasks)
    section = DigestSection(
        title="Маркетинг · 90 дней",
        text="Сверьтесь с общим планом: сделано {done} из {total}.".format(
            done=done, total=total
        ),
        items=tuple(open_tasks),
        link=_admin_url("/admin/marketing/90-days"),
        link_label="Открыть план на квартал",
    )
    for key in buckets:
        buckets[key].append(section)


def _open_quarter_tasks(quarter: MarketingQuarter) -> Tuple[List[str], int]:
    blocks = sorted(quarter.blocks or [], key=lambda block: (block.position, block.id))
    open_lines: List[str] = []
    total = 0
    for block in blocks:
        tasks = sorted(block.tasks or [], key=lambda task: (task.position, task.id))
        for task in tasks:
            total += 1
            if task.is_done:
                continue
            open_lines.append("{block}: {title}".format(block=block.title, title=task.title))
    return open_lines, total


def _owner_keys(owner: Optional[str]) -> List[AdminKey]:
    normalized = (owner or "").strip().casefold().replace("ё", "е")
    if normalized in _SERGEY_OWNERS:
        return [AdminKey.sereja]
    if normalized in _NASTYA_OWNERS:
        return [AdminKey.nastya]
    return [AdminKey.sereja, AdminKey.nastya]


def _top5_line(task: MarketingTop5Task) -> str:
    week_start = task.week.week_start.strftime("%d.%m.%Y")
    line = "Неделя с {week}: {title}".format(week=week_start, title=task.title)
    if len(_owner_keys(task.owner)) == 1:
        return line
    who = (task.owner or "").strip() or "исполнитель не указан"
    return "{line} · {who}".format(line=line, who=who)


def _was_sent(db: Session, sent_on: date, recipient: str) -> bool:
    row = (
        db.query(DigestDispatch.id)
        .filter(
            DigestDispatch.sent_on == sent_on,
            DigestDispatch.recipient == recipient,
        )
        .first()
    )
    return row is not None


def _mark_sent(db: Session, sent_on: date, recipient: str) -> None:
    db.add(DigestDispatch(sent_on=sent_on, recipient=recipient))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        logger.info("digest dispatch already recorded")


def _admin_url(path: str) -> str:
    return "{site}{path}".format(site=settings.SITE_URL.rstrip("/"), path=path)


def _as_moscow(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc).astimezone(MOSCOW_TZ)
    return value.astimezone(MOSCOW_TZ)


def _type_label(value: object) -> str:
    if isinstance(value, AppointmentType):
        return _TYPE_LABELS.get(value, value.value)
    try:
        kind = AppointmentType(str(value))
    except ValueError:
        return str(value)
    return _TYPE_LABELS.get(kind, str(value))


def _is_last_day_of_month(value: date) -> bool:
    return (value + timedelta(days=1)).month != value.month
