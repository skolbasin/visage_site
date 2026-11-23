import json
import logging
from datetime import date, datetime, timedelta, timezone

import pytest
from starlette.requests import Request

from app.core.logging_settings import ThreeDayFileHandler
from app.core.middleware import _booking_request_metadata


def test_three_day_handler_groups_files_in_year_and_month(tmp_path):
    handler = ThreeDayFileHandler(tmp_path, "access.log")
    handler.setFormatter(logging.Formatter("%(message)s"))

    record = logging.LogRecord(
        "test",
        logging.INFO,
        __file__,
        1,
        "first",
        (),
        None,
    )
    record.created = datetime(2026, 11, 15, 12, tzinfo=timezone.utc).timestamp()
    handler.emit(record)

    assert (tmp_path / "2026" / "11" / "access-2026-11-13.log").read_text() == "first\n"

    record.created = datetime(2026, 11, 16, 12, tzinfo=timezone.utc).timestamp()
    record.msg = "second"
    handler.emit(record)
    assert (tmp_path / "2026" / "11" / "access-2026-11-16.log").read_text() == "second\n"

    handler.close()


@pytest.mark.parametrize(
    ("current_date", "filename"),
    [
        (date(2026, 12, 1), "access-2026-12-01.log"),
        (date(2026, 12, 3), "access-2026-12-01.log"),
        (date(2026, 12, 4), "access-2026-12-04.log"),
        (date(2026, 12, 31), "access-2026-12-31.log"),
        (date(2027, 1, 1), "access-2027-01-01.log"),
    ],
)
def test_three_day_handler_uses_calendar_boundaries(tmp_path, current_date, filename):
    handler = ThreeDayFileHandler(tmp_path, "access.log")

    assert handler._path_for(current_date) == (
        tmp_path / str(current_date.year) / f"{current_date.month:02d}" / filename
    )
    handler.close()


def test_three_day_handler_deletes_files_older_than_retention(tmp_path):
    current_date = date(2026, 11, 15)
    cutoff_date = current_date - timedelta(days=183)
    expired_period_start = cutoff_date - timedelta(days=3)
    retained_period_start = cutoff_date
    handler = ThreeDayFileHandler(tmp_path, "access.log", retention_days=183)
    old_file = (
        tmp_path
        / f"{expired_period_start.year}"
        / f"{expired_period_start.month:02d}"
        / f"access-{expired_period_start.isoformat()}.log"
    )
    kept_file = (
        tmp_path
        / f"{retained_period_start.year}"
        / f"{retained_period_start.month:02d}"
        / f"access-{retained_period_start.isoformat()}.log"
    )
    old_file.parent.mkdir(parents=True)
    kept_file.parent.mkdir(parents=True, exist_ok=True)
    old_file.write_text("old")
    kept_file.write_text("keep")

    handler._cleanup_old_files(current_date)

    assert not old_file.exists()
    assert kept_file.exists()
    handler.close()


def test_booking_request_metadata_does_not_log_cookie_values():
    request = Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "POST",
            "scheme": "https",
            "path": "/api/v1/booking/",
            "raw_path": b"/api/v1/booking/",
            "query_string": b"",
            "headers": [
                (b"user-agent", b"Browser test"),
                (b"accept-language", b"ru-RU,ru;q=0.9"),
                (
                    b"referer",
                    b"https://user:password@example.com/booking?token=secret",
                ),
                (b"cookie", b"analytics_id=secret-value; session=private-token"),
            ],
            "client": ("192.0.2.10", 12345),
            "server": ("example.com", 443),
        }
    )

    metadata = _booking_request_metadata(request)

    assert metadata["client_ip_as_seen_by_proxy"] == "192.0.2.10"
    assert metadata["user_agent"] == "Browser test"
    assert metadata["accept_language"] == "ru-RU,ru;q=0.9"
    assert metadata["referer"] == "https://example.com/booking"
    assert metadata["cookie_names"] == ["analytics_id", "session"]
    assert "secret-value" not in repr(metadata)
    assert "private-token" not in repr(metadata)

    request.scope["headers"] = [
        (name, value)
        for name, value in request.scope["headers"]
        if name != b"referer"
    ] + [(b"referer", b"http://[")]
    assert _booking_request_metadata(Request(request.scope))["referer"] == "[invalid]"


def test_booking_submission_log_contains_metadata_and_outcome(client, caplog):
    start = datetime.now() + timedelta(days=2)
    headers = {
        "User-Agent": "Booking test browser",
        "Accept-Language": "ru-RU,ru;q=0.9",
        "Referer": "https://example.com/booking?campaign=private",
    }
    caplog.set_level(logging.INFO, logger="app.core.middleware")

    response = client.post(
        "/api/v1/booking/",
        json={
            "name": "Клиент",
            "phone": "+79001234567",
            "email": "client@example.com",
            "service_name": "Макияж",
            "appointment_date": start.isoformat(),
            "ready_by_date": start.isoformat(),
        },
        headers=headers,
        cookies={"analytics_id": "private-cookie-value"},
    )

    assert response.status_code == 200
    log_entry = next(
        record.getMessage()
        for record in caplog.records
        if record.getMessage().startswith("booking_request ")
    )
    metadata = json.loads(log_entry.removeprefix("booking_request "))

    assert metadata["outcome"] == "accepted"
    assert metadata["status_code"] == 200
    assert metadata["booking_id"] == response.json()["id"]
    assert metadata["user_agent"] == "Booking test browser"
    assert metadata["accept_language"] == "ru-RU,ru;q=0.9"
    assert metadata["referer"] == "https://example.com/booking"
    assert metadata["cookie_names"] == ["analytics_id"]
    assert "private-cookie-value" not in log_entry


@pytest.mark.parametrize(
    ("payload", "expected_reason", "expected_status"),
    [
        ({"website": "filled"}, "honeypot_filled", 400),
        ({"name": "хуй"}, "spam_language_detected", 400),
        ({"phone": "invalid"}, "validation_error", 422),
    ],
)
def test_booking_rejection_logs_outcome(
    client, caplog, payload, expected_reason, expected_status
):
    start = datetime.utcnow() + timedelta(days=2)
    booking = {
        "name": "Клиент",
        "phone": "+79001234567",
        "email": "client@example.com",
        "service_name": "Макияж",
        "appointment_date": start.isoformat(),
        "ready_by_date": start.isoformat(),
    }
    booking.update(payload)
    caplog.set_level(logging.INFO, logger="app.core.middleware")

    response = client.post("/api/v1/booking/", json=booking)

    assert response.status_code == expected_status
    log_entry = next(
        record.getMessage()
        for record in caplog.records
        if record.getMessage().startswith("booking_request ")
    )
    metadata = json.loads(log_entry.removeprefix("booking_request "))
    assert metadata["outcome"] == "rejected"
    assert metadata["status_code"] == expected_status
    assert metadata["rejection_reason"] == expected_reason
