import logging
from jose import jwt, JWTError

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.core.config import settings
from app.core.rate_limiting import limiter
from app.core.security import get_password_hash
from app.models.user import User
from app.models.promo import PromoCode
from app.schemas.user import UserCreate, UserLogin, Token, UserOut, RefreshToken
from app.services.promo_service import generate_promo_code
from app.core.dependencies import oauth2_scheme

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserOut)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Регистрация нового пользователя с генерацией промокода 10%."""
    # Проверка существования пользователя
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Создание пользователя
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
    logger.info(f"New user registered: {user.email} (id={user.id})")

    # Генерация промокода
    promo_code_str = generate_promo_code(user.id)
    promo = PromoCode(
        code=promo_code_str, discount_percent=10, owner_id=user.id, is_used=False
    )
    db.add(promo)
    db.commit()

    return user


@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def login(user_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    logger.info(f"Login attempt: {user_data.email}")

    # Ищем пользователя по email
    user = db.query(User).filter((User.email == user_data.email)).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect login or password")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="Account is disabled")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    logger.info(
        f"User logged in: {user.email} (id={user.id}), is_admin={user.is_admin}"
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_data: RefreshToken, db: Session = Depends(get_db)):
    """Обновление токенов с использованием refresh токена."""
    user_id = verify_refresh_token(refresh_data.refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserOut)
def get_me(
    request: Request, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_admin=user.is_admin,
        created_at=user.created_at,
    )
