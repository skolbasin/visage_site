import os

# Must be set before app / settings import
os.environ["SECRET_KEY"] = "pytest-secret-key-not-for-production"
os.environ["RATE_LIMIT_ENABLED"] = "true"
os.environ["RATE_LIMIT_AUTH"] = "1000/minute"
os.environ["RATE_LIMIT_DEFAULT"] = "1000/minute"
os.environ["RATE_LIMIT_BOOKING"] = "1000/hour"
os.environ["RATE_LIMIT_REVIEW"] = "1000/hour"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["RESEND_API_KEY"] = ""
os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["TELEGRAM_ADMIN_CHAT_ID"] = ""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.dependencies import get_db
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base
from app.main import app
from app.models.user import User


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def _mock_side_effects(monkeypatch):
    monkeypatch.setattr(
        "app.api.booking.send_booking_notification", lambda *args, **kwargs: True
    )
    monkeypatch.setattr(
        "app.api.question.send_question_notification", lambda *args, **kwargs: True
    )
    monkeypatch.setattr(
        "app.api.certificates.send_certificate_notification",
        lambda *args, **kwargs: True,
    )


@pytest.fixture()
def db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_user(db):
    user = User(
        email="admin@test.com",
        full_name="Test Admin",
        hashed_password=get_password_hash("adminpass123"),
        is_active=True,
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def regular_user(db):
    user = User(
        email="user@test.com",
        full_name="Test User",
        hashed_password=get_password_hash("userpass123"),
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def admin_headers(admin_user):
    token = create_access_token(admin_user.id)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def user_headers(regular_user):
    token = create_access_token(regular_user.id)
    return {"Authorization": f"Bearer {token}"}
