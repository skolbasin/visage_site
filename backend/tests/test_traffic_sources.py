from datetime import datetime, timezone
from decimal import Decimal

from app.models.calendar_appointment import (
    AppointmentStatus,
    AppointmentType,
    CalendarAppointment,
    ClientSource,
    Workplace,
)
from app.models.traffic_source import MarketingTrafficMetric


def _appointment(db, source, starts_at, source_other=None):
    db.add(
        CalendarAppointment(
            name="Клиент",
            client_source=source,
            client_source_other=source_other,
            appointment_type=AppointmentType.makeup,
            contact="+79001112233",
            duration_minutes=90,
            starts_at=starts_at,
            ends_at=starts_at.replace(minute=30),
            has_prepayment=False,
            workplace=Workplace.studio,
            status=AppointmentStatus.scheduled,
            reschedule_count=0,
        )
    )
    db.commit()


def test_traffic_metrics_require_admin(client, user_headers):
    response = client.get(
        "/api/v1/admin/marketing/traffic-sources/2026",
        headers=user_headers,
    )
    assert response.status_code == 403


def test_traffic_sources_count_applications_and_return_saved_metrics(
    client, admin_headers, db
):
    _appointment(
        db,
        ClientSource.profi,
        datetime(2026, 1, 8, 12, tzinfo=timezone.utc),
    )
    _appointment(
        db,
        ClientSource.instagram,
        datetime(2026, 1, 22, 12, tzinfo=timezone.utc),
    )
    _appointment(
        db,
        ClientSource.other,
        datetime(2026, 2, 1, 12, tzinfo=timezone.utc),
        "Pinterest",
    )
    _appointment(
        db,
        ClientSource.website,
        datetime(2026, 1, 15, 12, tzinfo=timezone.utc),
    )

    saved_profi = client.put(
        "/api/v1/admin/marketing/traffic-sources/profi_ru/2026/1",
        headers=admin_headers,
        json={
            "ad_spend": "1250.50",
            "subscription_cost": "999",
            "subscription_active": True,
        },
    )
    assert saved_profi.status_code == 200
    assert saved_profi.json()["applications"] == 1
    assert saved_profi.json()["ad_spend"] == "1250.50"
    assert saved_profi.json()["subscription_active"] is True

    saved_instagram = client.put(
        "/api/v1/admin/marketing/traffic-sources/instagram/2026/1",
        headers=admin_headers,
        json={"followers_count": 1000, "reels_count": 4, "initiatives": "Коллаборация"},
    )
    assert saved_instagram.status_code == 200
    assert saved_instagram.json()["applications"] == 1

    saved_pinterest = client.put(
        "/api/v1/admin/marketing/traffic-sources/pinterest/2026/2",
        headers=admin_headers,
        json={"views_count": 2500, "pins_count": 12},
    )
    assert saved_pinterest.status_code == 200
    assert saved_pinterest.json()["applications"] == 1

    response = client.get(
        "/api/v1/admin/marketing/traffic-sources/2026",
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()["sources"]
    assert data["profi_ru"][0]["applications"] == 1
    assert data["instagram"][0]["initiatives"] == "Коллаборация"
    assert data["pinterest"][1]["views_count"] == 2500
    assert data["pinterest"][0]["applications"] == 0


def test_instagram_growth_compares_with_previous_month_and_previous_year(
    client, admin_headers, db
):
    db.add_all(
        [
            MarketingTrafficMetric(
                source="instagram",
                year=2025,
                month=12,
                followers_count=1000,
                reels_count=0,
            ),
            MarketingTrafficMetric(
                source="instagram",
                year=2026,
                month=1,
                followers_count=1100,
                reels_count=1,
            ),
            MarketingTrafficMetric(
                source="instagram",
                year=2026,
                month=2,
                followers_count=990,
                reels_count=2,
            ),
        ]
    )
    db.commit()

    response = client.get(
        "/api/v1/admin/marketing/traffic-sources/2026",
        headers=admin_headers,
    )
    assert response.status_code == 200
    months = response.json()["sources"]["instagram"]
    assert months[0]["follower_growth_pct"] == 10.0
    assert months[1]["follower_growth_pct"] == -10.0


def test_traffic_metric_validation_and_upsert(client, admin_headers, db):
    endpoint = "/api/v1/admin/marketing/traffic-sources/profi_ru/2026/3"
    missing = client.put(endpoint, headers=admin_headers, json={"ad_spend": 0})
    assert missing.status_code == 422

    wrong_source_field = client.put(
        endpoint,
        headers=admin_headers,
        json={
            "ad_spend": 10,
            "subscription_cost": 0,
            "subscription_active": False,
            "pins_count": 5,
        },
    )
    assert wrong_source_field.status_code == 422

    negative = client.put(
        endpoint,
        headers=admin_headers,
        json={
            "ad_spend": -1,
            "subscription_cost": 0,
            "subscription_active": False,
        },
    )
    assert negative.status_code == 422

    payload = {
        "ad_spend": "20.25",
        "subscription_cost": "0",
        "subscription_active": False,
    }
    assert client.put(endpoint, headers=admin_headers, json=payload).status_code == 200
    payload["ad_spend"] = "75.50"
    assert client.put(endpoint, headers=admin_headers, json=payload).status_code == 200
    row_count = (
        db.query(MarketingTrafficMetric)
        .filter_by(source="profi_ru", year=2026, month=3)
        .count()
    )
    assert row_count == 1
    row = (
        db.query(MarketingTrafficMetric)
        .filter_by(source="profi_ru", year=2026, month=3)
        .one()
    )
    assert row.ad_spend == Decimal("75.50")
