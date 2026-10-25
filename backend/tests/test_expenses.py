from datetime import date

from app.models.expense import RecurringInterval, add_calendar_months, iter_occurrences


def test_expenses_forbidden_for_user(client, user_headers):
    response = client.get("/api/v1/admin/expenses", headers=user_headers)
    assert response.status_code == 403


def test_create_list_and_filter_expense(client, admin_headers):
    categories = client.get("/api/v1/admin/expenses/categories", headers=admin_headers)
    assert categories.status_code == 200
    names = [c["name"] for c in categories.json()]
    assert "Продукты" in names
    category_id = next(c["id"] for c in categories.json() if c["name"] == "Продукты")

    created = client.post(
        "/api/v1/admin/expenses",
        headers=admin_headers,
        json={
            "spent_on": "2026-10-25",
            "amount": "450.50",
            "category_id": category_id,
            "paid_by": "sereja",
            "is_shared": False,
            "comment": "молоко",
        },
    )
    assert created.status_code == 200
    expense_id = created.json()["id"]
    assert created.json()["category_name"] == "Продукты"

    listed = client.get(
        "/api/v1/admin/expenses",
        headers=admin_headers,
        params={"from": "2026-10-25", "to": "2026-10-25"},
    )
    assert listed.status_code == 200
    body = listed.json()
    assert body["summary"]["total"] == "450.50"
    assert body["summary"]["personal_sereja"] == "450.50"
    assert body["summary"]["shared"] == "0"
    assert len(body["items"]) == 1

    filtered = client.get(
        "/api/v1/admin/expenses",
        headers=admin_headers,
        params={"from": "2026-10-25", "to": "2026-10-25", "is_shared": True},
    )
    assert filtered.json()["items"] == []
    assert filtered.json()["summary"]["total"] == "0"

    deleted = client.delete(
        f"/api/v1/admin/expenses/{expense_id}", headers=admin_headers
    )
    assert deleted.status_code == 200
    after = client.get(
        "/api/v1/admin/expenses",
        headers=admin_headers,
        params={"from": "2026-10-25", "to": "2026-10-25"},
    )
    assert after.json()["items"] == []


def test_recurring_materializes_monthly_with_clamp(client, admin_headers):
    categories = client.get("/api/v1/admin/expenses/categories", headers=admin_headers)
    category_id = next(c["id"] for c in categories.json() if c["name"] == "Жильё")

    rule = client.post(
        "/api/v1/admin/expenses/recurring",
        headers=admin_headers,
        json={
            "title": "Аренда",
            "amount": "50000",
            "category_id": category_id,
            "paid_by": "nastya",
            "is_shared": True,
            "interval": "monthly",
            "start_date": "2026-01-31",
        },
    )
    assert rule.status_code == 200

    listed = client.get(
        "/api/v1/admin/expenses",
        headers=admin_headers,
        params={"from": "2026-02-01", "to": "2026-02-28"},
    )
    assert listed.status_code == 200
    items = listed.json()["items"]
    assert len(items) == 1
    assert items[0]["spent_on"] == "2026-02-28"
    assert items[0]["is_shared"] is True
    assert listed.json()["summary"]["shared"] == "50000.00"

    listed_again = client.get(
        "/api/v1/admin/expenses",
        headers=admin_headers,
        params={"from": "2026-02-01", "to": "2026-02-28"},
    )
    assert len(listed_again.json()["items"]) == 1


def test_custom_category_and_add_calendar_months():
    assert add_calendar_months(date(2026, 1, 31), 1) == date(2026, 2, 28)
    assert add_calendar_months(date(2026, 1, 31), 3) == date(2026, 4, 30)
    days = list(
        iter_occurrences(
            date(2026, 1, 31),
            RecurringInterval.monthly,
            date(2026, 1, 1),
            date(2026, 4, 30),
        )
    )
    assert days == [
        date(2026, 1, 31),
        date(2026, 2, 28),
        date(2026, 3, 31),
        date(2026, 4, 30),
    ]
