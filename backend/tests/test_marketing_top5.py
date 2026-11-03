from datetime import date


def test_top5_forbidden_for_user(client, user_headers):
    response = client.get("/api/v1/admin/marketing/top5", headers=user_headers)
    assert response.status_code == 403


def test_top5_week_normalizes_to_monday_and_limits_tasks(client, admin_headers):
    created = client.post(
        "/api/v1/admin/marketing/top5/tasks",
        headers=admin_headers,
        json={
            "week": "2026-11-04",
            "title": "  Написать пост  ",
            "owner": "  ",
            "weekday": 0,
        },
    )
    assert created.status_code == 200
    body = created.json()
    assert body["week_start"] == "2026-11-02"
    assert body["week_end"] == "2026-11-06"
    assert body["total"] == 1
    assert body["tasks"][0]["title"] == "Написать пост"
    assert body["tasks"][0]["owner"] is None
    assert body["tasks"][0]["weekday"] == 0

    task_id = body["tasks"][0]["id"]
    for index in range(2, 8):
        extra = client.post(
            "/api/v1/admin/marketing/top5/tasks",
            headers=admin_headers,
            json={"week": "2026-11-08", "title": f"Задача {index}"},
        )
        assert extra.status_code == 200

    overflow = client.post(
        "/api/v1/admin/marketing/top5/tasks",
        headers=admin_headers,
        json={"week": "2026-11-02", "title": "Лишняя"},
    )
    assert overflow.status_code == 400

    updated = client.patch(
        f"/api/v1/admin/marketing/top5/tasks/{task_id}",
        headers=admin_headers,
        json={"is_done": True, "position": 7, "owner": "Настя"},
    )
    assert updated.status_code == 200
    tasks = updated.json()["tasks"]
    assert tasks[-1]["id"] == task_id
    assert tasks[-1]["is_done"] is True
    assert tasks[-1]["owner"] == "Настя"
    assert tasks[-1]["done_at"] is not None
    assert [item["position"] for item in tasks] == [1, 2, 3, 4, 5, 6, 7]

    cleared = client.patch(
        f"/api/v1/admin/marketing/top5/tasks/{task_id}",
        headers=admin_headers,
        json={"is_done": False, "weekday": None},
    )
    assert cleared.status_code == 200
    last = cleared.json()["tasks"][-1]
    assert last["is_done"] is False
    assert last["done_at"] is None
    assert last["weekday"] is None


def test_top5_history_keeps_empty_weeks_and_delete_removes_week(client, admin_headers):
    created = client.post(
        "/api/v1/admin/marketing/top5/tasks",
        headers=admin_headers,
        json={"week": "2026-10-28", "title": "Разобрать отзывы"},
    )
    task_id = created.json()["tasks"][0]["id"]

    history = client.get(
        "/api/v1/admin/marketing/top5/history",
        headers=admin_headers,
        params={"weeks": 3, "anchor": "2026-11-05"},
    )
    assert history.status_code == 200
    items = history.json()
    assert [item["week_start"] for item in items] == [
        "2026-10-19",
        "2026-10-26",
        "2026-11-02",
    ]
    assert items[0]["total"] == 0
    assert items[1]["total"] == 1
    assert items[1]["week_end"] == "2026-10-30"

    deleted = client.delete(
        f"/api/v1/admin/marketing/top5/tasks/{task_id}",
        headers=admin_headers,
    )
    assert deleted.status_code == 200
    assert deleted.json()["total"] == 0
    assert deleted.json()["week_start"] == "2026-10-26"

    missing = client.patch(
        f"/api/v1/admin/marketing/top5/tasks/{task_id}",
        headers=admin_headers,
        json={"title": "Уже нет"},
    )
    assert missing.status_code == 404


def test_current_top5_week_starts_on_monday(client, admin_headers):
    response = client.get("/api/v1/admin/marketing/top5", headers=admin_headers)
    assert response.status_code == 200
    week_start = date.fromisoformat(response.json()["week_start"])
    assert week_start.weekday() == 0
    assert response.json()["max_tasks"] == 7
    assert response.json()["min_tasks"] == 2
