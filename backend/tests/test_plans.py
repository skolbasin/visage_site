def test_plans_require_admin(client, user_headers):
    response = client.get(
        "/api/v1/admin/plans",
        headers=user_headers,
        params={"owner": "nastya", "period_type": "year", "year": 2026},
    )
    assert response.status_code == 403


def test_create_update_and_delete_checkbox_plan(client, admin_headers):
    created = client.post(
        "/api/v1/admin/plans",
        headers=admin_headers,
        json={
            "owner": "nastya",
            "period_type": "year",
            "year": 2026,
            "title": "Сделать ремонт",
        },
    )
    assert created.status_code == 200
    item = created.json()
    assert item["is_done"] is False
    item_id = item["id"]

    updated = client.patch(
        f"/api/v1/admin/plans/{item_id}",
        headers=admin_headers,
        json={"is_done": True},
    )
    assert updated.status_code == 200
    assert updated.json()["is_done"] is True
    assert updated.json()["done_at"] is not None

    invalid_update = client.patch(
        f"/api/v1/admin/plans/{item_id}",
        headers=admin_headers,
        json={"is_done": None},
    )
    assert invalid_update.status_code == 422

    listed = client.get(
        "/api/v1/admin/plans",
        headers=admin_headers,
        params={"owner": "nastya", "period_type": "year", "year": 2026},
    )
    assert [row["id"] for row in listed.json()] == [item_id]

    deleted = client.delete(f"/api/v1/admin/plans/{item_id}", headers=admin_headers)
    assert deleted.status_code == 200
    assert deleted.json()["message"] == "План удален"


def test_metric_plan_tracks_progress_and_filters_by_quarter(client, admin_headers):
    created = client.post(
        "/api/v1/admin/plans",
        headers=admin_headers,
        json={
            "owner": "sereja",
            "period_type": "quarter",
            "year": 2026,
            "quarter": 2,
            "title": "Накопить",
            "progress_type": "metric",
            "target_value": 100000,
            "unit": "рублей",
        },
    )
    assert created.status_code == 200
    item = created.json()
    assert float(item["current_value"]) == 0
    assert item["is_done"] is False

    partial = client.patch(
        f"/api/v1/admin/plans/{item['id']}",
        headers=admin_headers,
        json={"current_value": 35000},
    )
    assert partial.status_code == 200
    assert float(partial.json()["current_value"]) == 35000
    assert partial.json()["is_done"] is False

    complete = client.patch(
        f"/api/v1/admin/plans/{item['id']}",
        headers=admin_headers,
        json={"current_value": 100000},
    )
    assert complete.status_code == 200
    assert complete.json()["is_done"] is True
    assert complete.json()["done_at"] is not None
    invalid_completion = client.patch(
        f"/api/v1/admin/plans/{item['id']}",
        headers=admin_headers,
        json={"is_done": False},
    )
    assert invalid_completion.status_code == 422

    quarter_list = client.get(
        "/api/v1/admin/plans",
        headers=admin_headers,
        params={
            "owner": "sereja",
            "period_type": "quarter",
            "year": 2026,
            "quarter": 2,
        },
    )
    assert len(quarter_list.json()) == 1

    other_quarter = client.get(
        "/api/v1/admin/plans",
        headers=admin_headers,
        params={
            "owner": "sereja",
            "period_type": "quarter",
            "year": 2026,
            "quarter": 3,
        },
    )
    assert other_quarter.json() == []


def test_plan_validation_rejects_missing_metric_target_and_quarter(
    client, admin_headers
):
    missing_target = client.post(
        "/api/v1/admin/plans",
        headers=admin_headers,
        json={
            "owner": "nastya",
            "period_type": "year",
            "year": 2026,
            "title": "Цель",
            "progress_type": "metric",
        },
    )
    assert missing_target.status_code == 422

    missing_quarter = client.post(
        "/api/v1/admin/plans",
        headers=admin_headers,
        json={
            "owner": "nastya",
            "period_type": "quarter",
            "year": 2026,
            "title": "Цель",
        },
    )
    assert missing_quarter.status_code == 422
