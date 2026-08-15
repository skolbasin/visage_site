from datetime import datetime, timedelta, timezone


def _appointment_payload(**overrides):
    starts = datetime.now(timezone.utc) + timedelta(days=1)
    payload = {
        "name": "Анна",
        "client_source": "instagram",
        "appointment_type": "makeup",
        "contact": "+79001234567",
        "price": 5000,
        "starts_at": starts.isoformat(),
        "has_prepayment": False,
        "workplace": "studio",
        "comment": "Тест",
        "guests": [],
    }
    payload.update(overrides)
    return payload


def test_calendar_requires_admin(client, user_headers):
    response = client.get("/api/v1/admin/calendar/appointments", headers=user_headers)
    assert response.status_code == 403


def test_create_appointment_sets_duration(client, admin_headers):
    response = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(),
    )
    assert response.status_code == 201
    data = response.json()
    start = datetime.fromisoformat(data["starts_at"].replace("Z", "+00:00"))
    end = datetime.fromisoformat(data["ends_at"].replace("Z", "+00:00"))
    assert (end - start) == timedelta(hours=1, minutes=30)
    assert data["status"] == "scheduled"
    assert data["contact"] == "+79001234567"
    assert data["workplace"] == "studio"
    assert data["people_count"] == 1
    assert data["is_group"] is False


def test_create_appointment_without_price(client, admin_headers):
    response = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(price=None, comment="Цена уточняется"),
    )
    assert response.status_code == 201
    assert response.json()["price"] is None
    assert float(response.json()["total_price"]) == 0


def test_create_group_appointment_sums_duration_and_price(client, admin_headers):
    response = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(
            appointment_type="wedding_look",
            price=11000,
            guests=[
                {"name": "Мама", "appointment_type": "makeup", "price": 5000},
                {"name": "Подруга", "appointment_type": "hair", "price": 4000},
            ],
        ),
    )
    assert response.status_code == 201
    data = response.json()
    start = datetime.fromisoformat(data["starts_at"].replace("Z", "+00:00"))
    end = datetime.fromisoformat(data["ends_at"].replace("Z", "+00:00"))
    # 2.5 + 1.5 + 1.5 = 5.5 hours
    assert (end - start) == timedelta(hours=5, minutes=30)
    assert data["people_count"] == 3
    assert data["is_group"] is True
    assert float(data["total_price"]) == 20000
    assert len(data["guests"]) == 2


def test_create_appointment_with_prepayment_validation(client, admin_headers):
    bad = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(has_prepayment=True, prepayment_amount=0),
    )
    assert bad.status_code == 422

    ok = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(has_prepayment=True, prepayment_amount=1000),
    )
    assert ok.status_code == 201
    assert ok.json()["prepayment_amount"] == "1000.00" or float(
        ok.json()["prepayment_amount"]
    ) == 1000


def test_create_requires_contact(client, admin_headers):
    response = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(contact=""),
    )
    assert response.status_code == 422


def test_create_other_source_requires_text(client, admin_headers):
    response = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(client_source="other", client_source_other=""),
    )
    assert response.status_code == 422


def test_update_status_and_delete_appointment(client, admin_headers):
    created = client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(appointment_type="wedding_look"),
    ).json()

    start = datetime.fromisoformat(created["starts_at"].replace("Z", "+00:00"))
    end = datetime.fromisoformat(created["ends_at"].replace("Z", "+00:00"))
    assert (end - start) == timedelta(hours=2, minutes=30)

    updated = client.patch(
        f"/api/v1/admin/calendar/appointments/{created['id']}/status",
        headers=admin_headers,
        json={"status": "completed"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "completed"

    deleted = client.delete(
        f"/api/v1/admin/calendar/appointments/{created['id']}",
        headers=admin_headers,
    )
    assert deleted.status_code == 200

    listed = client.get("/api/v1/admin/calendar/appointments", headers=admin_headers)
    assert all(item["id"] != created["id"] for item in listed.json())


def test_list_appointments_date_filter(client, admin_headers):
    client.post(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        json=_appointment_payload(),
    )
    far = datetime.now(timezone.utc) + timedelta(days=40)
    near_from = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    near_to = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    far_from = far.isoformat()
    far_to = (far + timedelta(days=1)).isoformat()

    near = client.get(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        params={"from": near_from, "to": near_to},
    )
    assert near.status_code == 200
    assert len(near.json()) >= 1

    empty = client.get(
        "/api/v1/admin/calendar/appointments",
        headers=admin_headers,
        params={"from": far_from, "to": far_to},
    )
    assert empty.status_code == 200
    assert empty.json() == []
