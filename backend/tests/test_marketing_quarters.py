from datetime import date

from app.models.marketing import quarter_end_of, quarter_start_of


def test_quarter_bounds():
    assert quarter_start_of(date(2026, 11, 3)) == date(2026, 10, 1)
    assert quarter_end_of(date(2026, 10, 1)) == date(2026, 12, 31)
    assert quarter_start_of(date(2026, 1, 15)) == date(2026, 1, 1)
    assert quarter_end_of(date(2026, 1, 1)) == date(2026, 3, 31)
    assert quarter_end_of(date(2026, 4, 1)) == date(2026, 6, 30)


def test_quarters_forbidden_for_user(client, user_headers):
    response = client.get("/api/v1/admin/marketing/quarters", headers=user_headers)
    assert response.status_code == 403


def _create(client, admin_headers, on="2026-11-03"):
    response = client.post(
        "/api/v1/admin/marketing/quarters",
        headers=admin_headers,
        json={"on": on},
    )
    assert response.status_code == 200
    return response.json()


def test_quarter_plan_blocks_tasks_and_limit(client, admin_headers):
    created = _create(client, admin_headers)
    assert created["starts_on"] == "2026-10-01"
    assert created["ends_on"] == "2026-12-31"
    assert created["exists"] is True
    assert created["max_tasks"] == 40
    assert created["soft_max"] == 30
    assert [block["title"] for block in created["blocks"]] == [
        "Интернет",
        "Привлечение клиентов",
        "Удержание клиентов",
        "Аналитика",
        "PR",
    ]
    assert [review["month_start"] for review in created["reviews"]] == [
        "2026-10-01",
        "2026-11-01",
        "2026-12-01",
    ]

    again = _create(client, admin_headers, on="2026-12-31")
    assert again["blocks"][0]["id"] == created["blocks"][0]["id"]

    internet_id = created["blocks"][0]["id"]
    pr_id = created["blocks"][4]["id"]
    first = client.post(
        "/api/v1/admin/marketing/quarters/tasks",
        headers=admin_headers,
        json={"block_id": internet_id, "title": "  Обновить сайт  "},
    )
    assert first.status_code == 200
    task_id = first.json()["blocks"][0]["tasks"][0]["id"]

    second = client.post(
        "/api/v1/admin/marketing/quarters/tasks",
        headers=admin_headers,
        json={"block_id": internet_id, "title": "Собрать кейсы"},
    )
    assert second.json()["total"] == 2

    moved = client.patch(
        f"/api/v1/admin/marketing/quarters/tasks/{task_id}",
        headers=admin_headers,
        json={"is_done": True, "block_id": pr_id, "position": 1},
    )
    assert moved.status_code == 200
    body = moved.json()
    assert body["done"] == 1
    assert [task["title"] for task in body["blocks"][0]["tasks"]] == ["Собрать кейсы"]
    assert body["blocks"][4]["tasks"][0]["id"] == task_id
    assert body["blocks"][4]["tasks"][0]["is_done"] is True
    assert body["blocks"][4]["tasks"][0]["done_at"] is not None

    for index in range(38):
        extra = client.post(
            "/api/v1/admin/marketing/quarters/tasks",
            headers=admin_headers,
            json={"block_id": internet_id, "title": f"Задача {index}"},
        )
        assert extra.status_code == 200

    overflow = client.post(
        "/api/v1/admin/marketing/quarters/tasks",
        headers=admin_headers,
        json={"block_id": internet_id, "title": "Лишняя"},
    )
    assert overflow.status_code == 400


def test_quarter_review_retrospective_and_history(client, admin_headers):
    created = _create(client, admin_headers, on="2026-08-01")
    block_id = created["blocks"][0]["id"]
    client.post(
        "/api/v1/admin/marketing/quarters/tasks",
        headers=admin_headers,
        json={"block_id": block_id, "title": "Серия постов"},
    )

    review = client.put(
        "/api/v1/admin/marketing/quarters/reviews",
        headers=admin_headers,
        json={"on": "2026-08-15", "month_index": 2, "note": "  Сдвинулся сайт  "},
    )
    assert review.status_code == 200
    assert review.json()["reviews"][1]["note"] == "Сдвинулся сайт"
    assert review.json()["reviews"][0]["note"] == ""

    history = client.get(
        "/api/v1/admin/marketing/quarters/history",
        headers=admin_headers,
        params={"limit": 2, "anchor": "2026-11-05"},
    )
    assert history.status_code == 200
    items = history.json()
    assert [item["starts_on"] for item in items] == ["2026-07-01", "2026-10-01"]
    assert items[0]["needs_review"] is True
    assert items[0]["total"] == 1
    assert items[1]["exists"] is False

    closed = client.patch(
        "/api/v1/admin/marketing/quarters",
        headers=admin_headers,
        json={"on": "2026-09-30", "retrospective": "Не хватило времени на съёмку"},
    )
    assert closed.status_code == 200
    assert closed.json()["retrospective"] == "Не хватило времени на съёмку"

    after = client.get(
        "/api/v1/admin/marketing/quarters/history",
        headers=admin_headers,
        params={"limit": 2, "anchor": "2026-11-05"},
    )
    assert after.json()[0]["needs_review"] is False

    removed = client.delete(
        f"/api/v1/admin/marketing/quarters/blocks/{block_id}",
        headers=admin_headers,
    )
    assert removed.status_code == 200
    assert removed.json()["total"] == 0
    assert len(removed.json()["blocks"]) == 4


def test_quarter_review_requires_plan(client, admin_headers):
    response = client.put(
        "/api/v1/admin/marketing/quarters/reviews",
        headers=admin_headers,
        json={"on": "2026-02-01", "month_index": 4, "note": "нет"},
    )
    assert response.status_code == 422

    missing = client.put(
        "/api/v1/admin/marketing/quarters/reviews",
        headers=admin_headers,
        json={"on": "2026-02-01", "month_index": 1, "note": "рано"},
    )
    assert missing.status_code == 404
