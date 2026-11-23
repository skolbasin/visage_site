from app.models.client import Client, ClientEvent


def client_payload(**overrides):
    payload = {
        "name": "Анна",
        "phone": "+79001234567",
        "email": "anna@example.com",
    }
    payload.update(overrides)
    return payload


def test_create_and_list_client(client, admin_headers, db):
    response = client.post(
        "/api/v1/admin/clients",
        headers=admin_headers,
        json=client_payload(
            age=28,
            instagram="@anna",
            events=[{
                "event_type": "makeup",
                "event_date": "2026-11-20T12:00:00",
                "cost": 5000,
                "comment": "Свадьба",
            }],
        ),
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Анна"
    assert data["age"] == 28
    assert len(data["events"]) == 1

    listed = client.get("/api/v1/admin/clients", headers=admin_headers)
    assert listed.status_code == 200
    assert any(item["id"] == data["id"] for item in listed.json())


def test_filter_and_search_clients(client, admin_headers):
    client.post("/api/v1/admin/clients", headers=admin_headers, json=client_payload())
    client.post("/api/v1/admin/clients", headers=admin_headers, json=client_payload(
        name="Мария", phone="+79005554433", email="maria@example.com", instagram="@maria"
    ))

    search = client.get("/api/v1/admin/clients?search=мария", headers=admin_headers)
    assert search.status_code == 200
    assert [item["name"] for item in search.json()] == ["Мария"]

    instagram = client.get("/api/v1/admin/clients?has_instagram=true", headers=admin_headers)
    assert instagram.status_code == 200
    assert all(item["instagram"] for item in instagram.json())


def test_update_and_delete_client_event(client, admin_headers):
    created = client.post(
        "/api/v1/admin/clients",
        headers=admin_headers,
        json=client_payload(events=[{
            "event_type": "hair",
            "event_date": "2026-11-20T12:00:00",
            "cost": 3000,
        }]),
    ).json()

    updated = client.patch(
        f"/api/v1/admin/clients/{created['id']}",
        headers=admin_headers,
        json={"name": "Анна-Мария", "age": 30},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Анна-Мария"

    event_id = created["events"][0]["id"]
    event_updated = client.patch(
        f"/api/v1/admin/clients/{created['id']}/events/{event_id}",
        headers=admin_headers,
        json={"cost": 4500, "comment": "Изменённая стоимость"},
    )
    assert event_updated.status_code == 200
    event = event_updated.json()["events"][0]
    assert float(event["cost"]) == 4500

    deleted = client.delete(
        f"/api/v1/admin/clients/{created['id']}/events/{event_id}",
        headers=admin_headers,
    )
    assert deleted.status_code == 200
    assert deleted.json()["events"] == []


def test_client_fields_are_stored_as_nullable(client, admin_headers, db):
    response = client.post(
        "/api/v1/admin/clients",
        headers=admin_headers,
        json={"name": None, "age": None, "phone": None, "email": None},
    )
    assert response.status_code == 201
    assert db.query(Client).count() == 1


def test_client_requires_admin(client, db):
    response = client.post("/api/v1/admin/clients", json=client_payload())
    assert response.status_code == 401
