def test_create_question_public(client):
    response = client.post(
        "/api/v1/questions",
        json={
            "message": "Сколько стоит макияж?",
            "contact_type": "telegram",
            "contact_value": "@client",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "new"
    assert data["message"] == "Сколько стоит макияж?"


def test_admin_questions_flow(client, admin_headers):
    created = client.post(
        "/api/v1/questions",
        json={
            "message": "Есть ли свободные даты?",
            "contact_type": "phone",
            "contact_value": "+79001112233",
        },
    ).json()

    listed = client.get("/api/v1/admin/questions", headers=admin_headers)
    assert listed.status_code == 200
    assert any(q["id"] == created["id"] for q in listed.json())

    updated = client.patch(
        f"/api/v1/admin/questions/{created['id']}/status",
        headers=admin_headers,
        json={"status": "completed"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "completed"

    deleted = client.delete(
        f"/api/v1/admin/questions/{created['id']}",
        headers=admin_headers,
    )
    assert deleted.status_code == 200


def test_admin_questions_forbidden_for_user(client, user_headers):
    response = client.get("/api/v1/admin/questions", headers=user_headers)
    assert response.status_code == 403
