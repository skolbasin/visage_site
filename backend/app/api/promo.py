import random
import string
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_admin_user, get_db
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.promo import PromoCodeCreate, PromoCodeOut, PromoCodeUpdate
from datetime import datetime

router = APIRouter(prefix="/promo", tags=["promo"])


@router.get("/", response_model=List[PromoCodeOut])
def get_all_promocodes(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Получение всех промокодов (админ)"""
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post("/", response_model=PromoCodeOut)
def create_promocode(
    promo_data: PromoCodeCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Создание промокода (админ)"""
    # Проверяем, существует ли уже такой код
    existing = db.query(PromoCode).filter(PromoCode.code == promo_data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Promo code already exists")

    # Если код не указан - генерируем автоматически
    code = promo_data.code
    if not code:
        code = generate_unique_code(db)

    # Создаём промокод
    promo = PromoCode(
        code=code,
        discount_percent=promo_data.discount_percent,
        is_used=False,
        owner_id=admin.id,  # привязываем к админу, создавшему промокод
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.put("/{promo_id}", response_model=PromoCodeOut)
def update_promocode(
    promo_id: int,
    promo_data: PromoCodeUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Обновление промокода (админ)"""
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")

    # Обновляем поля
    if promo_data.code:
        # Проверяем, что новый код не занят
        existing = (
            db.query(PromoCode)
            .filter(PromoCode.code == promo_data.code, PromoCode.id != promo_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Promo code already exists")
        promo.code = promo_data.code

    if promo_data.discount_percent is not None:
        promo.discount_percent = promo_data.discount_percent

    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/{promo_id}")
def delete_promocode(
    promo_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    """Удаление промокода (админ)"""
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")

    db.delete(promo)
    db.commit()
    return {"ok": True}


@router.get("/check/{code}")
def check_promocode(
    code: str,
    db: Session = Depends(get_db),
):
    """Проверка промокода (публично)"""
    promo = (
        db.query(PromoCode)
        .filter(PromoCode.code == code, PromoCode.is_used == False)
        .first()
    )
    if not promo:
        return {"valid": False, "discount": None}
    return {"valid": True, "discount": promo.discount_percent}


def generate_unique_code(db: Session, length: int = 10) -> str:
    """Генерация уникального кода промокода"""
    while True:
        code = "PROMO" + "".join(
            random.choices(string.ascii_uppercase + string.digits, k=length)
        )
        existing = db.query(PromoCode).filter(PromoCode.code == code).first()
        if not existing:
            return code
