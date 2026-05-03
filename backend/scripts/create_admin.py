"""
Скрипт для создания администратора в БД.
Запуск: docker exec -it makeup_backend_dev python scripts/create_admin.py
"""

import sys
from pathlib import Path
import getpass

sys.path.append(str(Path(__file__).parent.parent))

# Импортируем все модели через base
from app.db.base import Base
from app.db.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User


def create_admin():
    db = SessionLocal()

    print("\n=== Создание администратора ===\n")

    email = input("Email администратора: ").strip()

    password = getpass.getpass("Пароль: ")
    password2 = getpass.getpass("Повторите пароль: ")

    if password != password2:
        print("Пароли не совпадают")
        return

    # Проверяем, существует ли уже пользователь с таким email
    existing = db.query(User).filter(User.email == email).first()

    if existing:
        print(f"Пользователь с email {email} уже существует")
        return

    # Создаём админа
    admin = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=email,
        is_active=True,
        is_admin=True,
    )

    db.add(admin)
    db.commit()

    print(f"\nАдминистратор создан")
    print(f"   Email: {email}")

    db.close()


if __name__ == "__main__":
    create_admin()
