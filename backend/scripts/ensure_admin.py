"""Create or update an admin user from env vars.

  ADMIN_EMAIL
  ADMIN_PASSWORD
"""

import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User


def main() -> None:
    email = (os.environ.get("ADMIN_EMAIL") or "").strip()
    password = os.environ.get("ADMIN_PASSWORD") or ""
    if not email or not password:
        raise SystemExit("ADMIN_EMAIL and ADMIN_PASSWORD are required")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email.ilike(email)).first()
        if user:
            user.email = email
            user.hashed_password = get_password_hash(password)
            user.is_admin = True
            user.is_active = True
            action = "updated"
        else:
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name=email,
                is_active=True,
                is_admin=True,
            )
            db.add(user)
            action = "created"
        db.commit()
        db.refresh(user)
        print(f"{action}\tid={user.id}\temail={user.email}\tis_admin={user.is_admin}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
