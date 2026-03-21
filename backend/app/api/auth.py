import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_refresh_token
from app.core.config import settings
from app.core.rate_limiting import limiter
from app.models.user import User
from app.models.promo import PromoCode
from app.schemas.user import UserCreate, UserLogin, Token, UserOut, RefreshToken
from app.services.promo_service import generate_promo_code

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserOut)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def register(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
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
        is_admin=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"New user registered: {user.email} (id={user.id})")

    # Генерация промокода
    promo_code_str = generate_promo_code(user.id)
    promo = PromoCode(
        code=promo_code_str,
        discount_percent=10,
        owner_id=user.id,
        is_used=False
    )
    db.add(promo)
    db.commit()

    return user

@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def login(
    user_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """Аутентификация пользователя, возвращает пару токенов."""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    logger.info(f"User logged in: {user.email} (id={user.id})")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_data: RefreshToken,
    db: Session = Depends(get_db)
):
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
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    """Получение информации о текущем авторизованном пользователе."""
    return current_user