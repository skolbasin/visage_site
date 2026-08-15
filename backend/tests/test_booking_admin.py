from datetime import datetime, timedelta


def _booking_payload(**overrides):
    start = datetime.utcnow() + timedelta(days=2)
    payload = {
        "name": "Клиент",
        "phone": "+79001234567",
        "email": "client@example.com",
        "service_name": "Макияж в студии",
        "appointment_date": start.isoformat(),
        "ready_by_date": start.isoformat(),
        "comment": "Тест",
    }
    payload.update(overrides)
    return payload


def test_create_booking(client):
    response = client.post("/api/v1/booking/", json=_booking_payload())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Клиент"
    assert data["status"] == "new"
    assert data["id"] > 0


def test_create_booking_invalid_promo(client):
    response = client.post(
        "/api/v1/booking/",
        json=_booking_payload(promo_code="NOTEXIST"),
    )
    assert response.status_code == 400
    assert "не существует" in response.json()["detail"]


def test_admin_list_and_update_booking_status(client, admin_headers):
    created = client.post("/api/v1/booking/", json=_booking_payload()).json()

    listed = client.get("/api/v1/admin/bookings", headers=admin_headers)
    assert listed.status_code == 200
    assert any(b["id"] == created["id"] for b in listed.json())

    updated = client.patch(
        f"/api/v1/admin/bookings/{created['id']}/status",
        headers=admin_headers,
        json={"status": "in_progress"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "in_progress"


def test_admin_bookings_forbidden_for_user(client, user_headers):
    response = client.get("/api/v1/admin/bookings", headers=user_headers)
    assert response.status_code == 403


def test_admin_delete_booking(client, admin_headers):
    created = client.post("/api/v1/booking/", json=_booking_payload()).json()
    deleted = client.delete(
        f"/api/v1/admin/bookings/{created['id']}",
        headers=admin_headers,
    )
    assert deleted.status_code == 200

    listed = client.get("/api/v1/admin/bookings", headers=admin_headers)
    assert all(b["id"] != created["id"] for b in listed.json())


def test_admin_counts(client, admin_headers):
    client.post("/api/v1/booking/", json=_booking_payload())
    response = client.get("/api/v1/admin/counts", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "bookings" in data
    assert data["bookings"] >= 1
