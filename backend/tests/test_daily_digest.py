from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

import resend

from app.core.config import settings
from app.models.calendar_appointment import (
    AppointmentStatus,
    AppointmentType,
    CalendarAppointment,
    ClientSource,
    Workplace,
)
from app.models.expense import (
    Expense,
    ExpenseCategory,
    ExpensePayer,
    ExpenseRecurring,
    RecurringInterval,
)
from app.models.marketing import (
    MarketingQuarter,
    MarketingQuarterBlock,
    MarketingQuarterTask,
    MarketingTop5Task,
    MarketingTop5Week,
    monday_of,
    quarter_start_of,
)
from app.services.digest_scheduler import _is_due, _seconds_until_next
from app.services.digest_service import (
    DigestSection,
    collect_reports,
    run_daily_digest,
)
from app.services.email_service import (
    send_booking_notification,
    send_certificate_notification,
    send_digest_email,
    send_question_notification,
)
from app.services.moscow_time import MOSCOW_TZ

SERGEY = "sergey@example.com"
NASTYA = "romancha.96@list.ru"
TODAY = date(2026, 11, 6)
LAST_DAY = date(2026, 11, 30)


def _reports(db, today):
    found = collect_reports(db, today)
    return {report.recipient.email: report for report in found}


def _section(report, title):
    if report is None:
        return None
    for section in report.sections:
        if section.title == title:
            return section
    return None


def _category(db):
    found = db.query(ExpenseCategory).filter_by(name="Продукты").first()
    if found is not None:
        return found
    row = ExpenseCategory(name="Продукты", is_system=True)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _expense(db, category, spent_on, payer, shared=False, deleted=False):
    db.add(
        Expense(
            spent_on=spent_on,
            amount=Decimal("100.00"),
            category_id=category.id,
            paid_by=payer,
            is_shared=shared,
            deleted_at=datetime.now(timezone.utc) if deleted else None,
        )
    )
    db.commit()


def _cover_expenses(db, today):
    category = _category(db)
    yesterday = today - timedelta(days=1)
    _expense(db, category, yesterday, ExpensePayer.sereja)
    _expense(db, category, yesterday, ExpensePayer.nastya)


def _appointment(db, starts_at, name, status=AppointmentStatus.scheduled):
    db.add(
        CalendarAppointment(
            name=name,
            client_source=ClientSource.instagram,
            appointment_type=AppointmentType.makeup,
            contact="+79001112233",
            duration_minutes=90,
            starts_at=starts_at,
            ends_at=starts_at + timedelta(minutes=90),
            has_prepayment=False,
            workplace=Workplace.studio,
            status=status,
            reschedule_count=0,
        )
    )
    db.commit()


def _top5(db, week_start, title, owner, position, done=False):
    week = db.query(MarketingTop5Week).filter_by(week_start=week_start).first()
    if week is None:
        week = MarketingTop5Week(week_start=week_start)
        db.add(week)
        db.flush()
    db.add(
        MarketingTop5Task(
            week_id=week.id,
            position=position,
            title=title,
            owner=owner,
            is_done=done,
        )
    )
    db.commit()


def _quarter(db, today, tasks):
    quarter = MarketingQuarter(starts_on=quarter_start_of(today))
    db.add(quarter)
    db.flush()
    block = MarketingQuarterBlock(quarter_id=quarter.id, title="Интернет", position=1)
    db.add(block)
    db.flush()
    for index, (title, done) in enumerate(tasks, start=1):
        db.add(
            MarketingQuarterTask(
                block_id=block.id,
                position=index,
                title=title,
                is_done=done,
            )
        )
    db.commit()


def test_operational_emails_go_to_both_admins(monkeypatch):
    monkeypatch.setattr(settings, "RESEND_API_KEY", "test-key")
    captured = []

    def fake_send(payload):
        captured.append(payload["to"])

    monkeypatch.setattr(resend.Emails, "send", fake_send)
    assert send_booking_notification({"name": "Анна"}) is True
    assert send_certificate_notification({"buyer_name": "Ольга"}) is True
    assert send_question_notification({"name": "Ира"}) is True
    assert captured == [[SERGEY, NASTYA], [SERGEY, NASTYA], [SERGEY, NASTYA]]


def test_missing_yesterday_expense_notifies_only_that_payer(db):
    category = _category(db)
    _expense(db, category, TODAY - timedelta(days=1), ExpensePayer.sereja)
    reports = _reports(db, TODAY)
    assert SERGEY not in reports
    section = _section(reports[NASTYA], "Расходы")
    assert section.text == (
        "Расходы за 05.11.2026 — 0. Либо вы вчера ничего не тратили, "
        "либо забыли заполнить."
    )
    assert section.link.endswith("/admin/expenses")


def test_deleted_expense_counts_as_empty(db):
    category = _category(db)
    _expense(
        db,
        category,
        TODAY - timedelta(days=1),
        ExpensePayer.sereja,
        deleted=True,
    )
    reports = _reports(db, TODAY)
    assert _section(reports[SERGEY], "Расходы") is not None
    assert _section(reports[NASTYA], "Расходы") is not None


def test_shared_expense_counts_only_for_payer(db):
    category = _category(db)
    _expense(
        db,
        category,
        TODAY - timedelta(days=1),
        ExpensePayer.sereja,
        shared=True,
    )
    reports = _reports(db, TODAY)
    assert SERGEY not in reports
    assert _section(reports[NASTYA], "Расходы") is not None


def test_recurring_charge_counts_as_filled(db):
    category = _category(db)
    yesterday = TODAY - timedelta(days=1)
    db.add(
        ExpenseRecurring(
            title="аренда",
            amount=Decimal("1000.00"),
            category_id=category.id,
            paid_by=ExpensePayer.sereja,
            is_shared=False,
            interval=RecurringInterval.monthly,
            start_date=yesterday,
            is_active=True,
        )
    )
    db.commit()
    reports = _reports(db, TODAY)
    assert SERGEY not in reports
    assert _section(reports[NASTYA], "Расходы") is not None


def test_past_scheduled_goes_only_to_nastya(db):
    _cover_expenses(db, TODAY)
    _appointment(db, datetime(2026, 11, 4, 12, 0, tzinfo=MOSCOW_TZ), "Прошлая")
    _appointment(db, datetime(2026, 11, 6, 9, 0, tzinfo=MOSCOW_TZ), "Сегодня")
    _appointment(db, datetime(2026, 11, 7, 12, 0, tzinfo=MOSCOW_TZ), "Будущая")
    _appointment(
        db,
        datetime(2026, 11, 3, 12, 0, tzinfo=MOSCOW_TZ),
        "Закрытая",
        AppointmentStatus.completed,
    )
    reports = _reports(db, TODAY)
    assert SERGEY not in reports
    section = _section(reports[NASTYA], "Календарь")
    text = " ".join(section.items)
    assert "Прошлая" in text
    assert "Макияж" in text
    assert "04.11.2026" in text
    assert "Сегодня" not in text
    assert "Будущая" not in text
    assert "Закрытая" not in text
    assert section.link.endswith("/admin/calendar")


def test_top5_follows_owner_aliases(db):
    _cover_expenses(db, TODAY)
    this_week = monday_of(TODAY)
    _top5(db, this_week, "Сторис", "Серёжа", 1)
    _top5(db, this_week, "Reels", "Анастасия", 2)
    _top5(db, this_week, "Готово", "Настя", 3, done=True)
    _top5(db, this_week, "Чужое", "Маркетолог", 4)
    _top5(db, this_week - timedelta(days=7), "Архив", None, 1)
    _top5(db, this_week + timedelta(days=7), "Потом", "Сергей", 1)
    reports = _reports(db, TODAY)
    sergey = " ".join(_section(reports[SERGEY], "Маркетинг · Топ-5").items)
    nastya = " ".join(_section(reports[NASTYA], "Маркетинг · Топ-5").items)
    assert "Сторис" in sergey and "Сторис" not in nastya
    assert "Reels" in nastya and "Reels" not in sergey
    assert "Готово" not in sergey and "Готово" not in nastya
    assert "Потом" not in sergey and "Потом" not in nastya
    assert "Архив" in sergey and "исполнитель не указан" in sergey
    assert "Архив" in nastya
    assert "Чужое" in sergey and "Маркетолог" in sergey
    assert "Чужое" in nastya
    assert _section(reports[SERGEY], "Маркетинг · Топ-5").link.endswith(
        "/admin/marketing/top-5"
    )


def test_quarter_progress_only_on_month_end(db):
    _cover_expenses(db, TODAY)
    _cover_expenses(db, LAST_DAY)
    _quarter(db, LAST_DAY, [("Сайт", True), ("Реклама", False)])
    assert _reports(db, TODAY) == {}
    end = _reports(db, LAST_DAY)
    for email in (SERGEY, NASTYA):
        section = _section(end[email], "Маркетинг · 90 дней")
        assert section.text == "Сверьтесь с общим планом: сделано 1 из 2."
        assert section.items == ("Интернет: Реклама",)
        assert section.link.endswith("/admin/marketing/90-days")


def test_closed_or_missing_quarter_is_silent(db):
    _cover_expenses(db, LAST_DAY)
    assert _reports(db, LAST_DAY) == {}
    _quarter(db, LAST_DAY, [("Сайт", True)])
    assert _reports(db, LAST_DAY) == {}


def test_empty_report_is_not_sent(db, monkeypatch):
    _cover_expenses(db, TODAY)
    calls = []
    monkeypatch.setattr(
        "app.services.digest_service.send_digest_email",
        lambda **kwargs: calls.append(kwargs) or True,
    )
    assert run_daily_digest(db, TODAY) == []
    assert calls == []


def test_digest_is_sent_once_per_day(db, monkeypatch):
    calls = []

    def fake_send(to, name, report_date, sections):
        calls.append(to)
        return True

    monkeypatch.setattr("app.services.digest_service.send_digest_email", fake_send)
    assert run_daily_digest(db, TODAY) == [SERGEY, NASTYA]
    assert run_daily_digest(db, TODAY) == []
    assert calls == [SERGEY, NASTYA]


def test_failed_send_is_retried(db, monkeypatch):
    state = {"ok": False}
    calls = []

    def fake_send(to, name, report_date, sections):
        calls.append(to)
        return state["ok"]

    monkeypatch.setattr("app.services.digest_service.send_digest_email", fake_send)
    assert run_daily_digest(db, TODAY) == []
    state["ok"] = True
    assert run_daily_digest(db, TODAY) == [SERGEY, NASTYA]
    assert calls == [SERGEY, NASTYA, SERGEY, NASTYA]


def test_digest_email_renders_for_one_recipient(monkeypatch):
    monkeypatch.setattr(settings, "RESEND_API_KEY", "test-key")
    captured = {}

    def fake_send(payload):
        captured.update(payload)

    monkeypatch.setattr(resend.Emails, "send", fake_send)
    section = DigestSection(
        title="Расходы",
        text=(
            "Расходы за 05.11.2026 — 0. Либо вы вчера ничего не тратили, "
            "либо забыли заполнить."
        ),
        items=tuple(),
        link="https://anastasia-romancha.ru/admin/expenses",
        link_label="Открыть расходы",
    )
    assert send_digest_email(SERGEY, "Сергей", "06.11.2026", (section,)) is True
    assert captured["to"] == [SERGEY]
    assert captured["subject"] == "Утренний отчёт за 06.11.2026"
    assert "Открыть расходы" in captured["html"]
    assert NASTYA not in captured["html"]


def test_scheduler_runs_at_ten_moscow():
    before = datetime(2026, 11, 6, 9, 59, tzinfo=MOSCOW_TZ)
    opening = datetime(2026, 11, 6, 10, 0, tzinfo=MOSCOW_TZ)
    later = datetime(2026, 11, 6, 11, 0, tzinfo=MOSCOW_TZ)
    assert _is_due(before) is False
    assert _is_due(opening) is True
    assert _seconds_until_next(before) == 60
    assert _seconds_until_next(later) == 23 * 60 * 60
