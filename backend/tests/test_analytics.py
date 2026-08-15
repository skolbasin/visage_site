from datetime import datetime, timedelta, timezone


def _create_completed(client, admin_headers, **overrides):
    starts = datetime.now(timezone.utc) - timedelta(days=1)
    payload = {
        "name": "Мария",
        "client_source": "profi",
        "appointment_type": "look",
        "price": 8000,
        "starts_at": starts.isoformat(),
        "has_prepayment": True,
        "prepayment_amount": 2000,
        "workplace": "Студия",
        "status": "completed",
    }
    payload.update(overrides)
    created = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=payload,
    )
    assert created.status_code == 201
    return created.json()


def test_analytics_requires_admin(client, user_headers):
    response = client.get("/api/v1/admin/analytics/overview", headers=user_headers)
    assert response.status_code == 403


def test_analytics_overview_and_revenue(client, admin_headers):
    _create_completed(client, admin_headers)
    _create_completed(
        client,
        admin_headers,
        client_source="instagram",
        price=5000,
        has_prepayment=False,
        prepayment_amount=None,
    )

    overview = client.get("/api/v1/admin/analytics/overview", headers=admin_headers)
    assert overview.status_code == 200
    data = overview.json()
    assert data["total"] >= 2
    assert data["completed"] >= 2
    assert data["revenue"] >= 13000

    revenue = client.get("/api/v1/admin/analytics/revenue", headers=admin_headers)
    assert revenue.status_code == 200
    rev = revenue.json()
    assert rev["total_revenue"] >= 13000
    assert rev["prepayments_total"] >= 2000


def test_analytics_sources_funnel_services(client, admin_headers):
    _create_completed(client, admin_headers, client_source="website")

    sources = client.get("/api/v1/admin/analytics/sources", headers=admin_headers)
    assert sources.status_code == 200
    assert sources.json()["total"] >= 1

    funnel = client.get("/api/v1/admin/analytics/funnel", headers=admin_headers)
    assert funnel.status_code == 200
    assert "conversion_to_visit" in funnel.json()

    services = client.get("/api/v1/admin/analytics/services", headers=admin_headers)
    assert services.status_code == 200
    assert "services" in services.json()

    quality = client.get("/api/v1/admin/analytics/quality", headers=admin_headers)
    assert quality.status_code == 200
    assert "by_source" in quality.json()
