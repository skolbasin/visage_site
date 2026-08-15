def test_register_and_login(client):
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "secret123",
            "full_name": "New User",
        },
    )
    assert register.status_code == 200
    body = register.json()
    assert body["email"] == "newuser@example.com"
    assert body["is_admin"] is False

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "newuser@example.com", "password": "secret123"},
    )
    assert login.status_code == 200
    tokens = login.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "newuser@example.com"


def test_register_duplicate_email(client):
    payload = {
        "email": "dup@example.com",
        "password": "secret123",
        "full_name": "Dup",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 200
    again = client.post("/api/v1/auth/register", json=payload)
    assert again.status_code == 400


def test_login_wrong_password(client, admin_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": "wrong"},
    )
    assert response.status_code == 401


def test_refresh_token(client, admin_user):
    login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": "adminpass123"},
    )
    refresh = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": login.json()["refresh_token"]},
    )
    assert refresh.status_code == 200
    assert "access_token" in refresh.json()


def test_me_requires_auth(client):
    assert client.get("/api/v1/auth/me").status_code == 401
