def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_portfolio_categories_public(client):
    response = client.get("/api/v1/portfolio/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_portfolio_items_public(client):
    response = client.get("/api/v1/portfolio/items")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
