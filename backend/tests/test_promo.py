def test_promo_check_not_found(client):
    response = client.get("/api/v1/promo/check/MISSING")
    assert response.status_code == 200
    assert response.json()["valid"] is False


def test_admin_create_and_check_promo(client, admin_headers):
    created = client.post(
        "/api/v1/promo/",
        headers=admin_headers,
        json={"code": "TEST10", "discount_percent": 10},
    )
    assert created.status_code == 200
    assert created.json()["code"] == "TEST10"

    listed = client.get("/api/v1/promo/", headers=admin_headers)
    assert listed.status_code == 200
    assert any(p["code"] == "TEST10" for p in listed.json())

    checked = client.get("/api/v1/promo/check/TEST10")
    assert checked.status_code == 200
    assert checked.json()["valid"] is True
    assert checked.json()["discount"] == 10


def test_promo_admin_forbidden_for_user(client, user_headers):
    response = client.get("/api/v1/promo/", headers=user_headers)
    assert response.status_code == 403
