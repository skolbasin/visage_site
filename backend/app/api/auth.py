from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.dependencies import get_db, get_current_user
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
)
from app.core.config import settings
from app.models.user import User
from app.models.promo import PromoCode
from app.schemas.user import UserCreate, UserLogin, Token, UserOut
from app.services.promo_service import generate_promo_code  # создадим позже
import random
import string

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Проверка, существует ли пользователь
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Хешируем пароль
    hashed = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed,
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Генерируем персональный промокод (10%)
    promo_code_str = generate_promo_code(user.id)  # например "PROMO_USERID_RANDOM"
    promo = PromoCode(
        code=promo_code_str, discount_percent=10, owner_id=user.id, is_used=False
    )
    db.add(promo)
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
def refresh(
    token_data: dict = Depends(oauth2_scheme),
):  # в реальности нужно принимать refresh токен в теле
    # Упрощённо: можно реализовать отдельно, но пока пропустим.
    pass


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
