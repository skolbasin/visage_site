import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_active_user,
    get_current_admin_user,
    get_db,
)
from app.models.booking import Booking, BookingStatus
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingUpdateStatus
from app.services.email_service import send_booking_notification

router = APIRouter(prefix="/booking", tags=["booking"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),  # может быть None
):
    """Публичный: создание заявки на запись"""
    # Проверка промокода, если указан
    promo_code_id = None

    if booking.promo_code:
        promo = db.query(PromoCode).filter(PromoCode.code == booking.promo_code).first()
        if not promo or promo.is_used:
            logger.warning(f"Invalid promo code attempted: {booking.promo_code}")
            raise HTTPException(
                status_code=400, detail="Invalid or already used promo code"
            )
        promo_code_id = promo.id
        # Пока не применяем скидку, просто сохраняем связь

    # Валидация: дата готовности >= даты записи уже в схеме

    # Создаём запись
    db_booking = Booking(
        user_id=current_user.id if current_user else None,
        name=booking.name,
        phone=booking.phone,
        email=booking.email,
        appointment_date=booking.appointment_date,
        ready_by_date=booking.ready_by_date,
        comment=booking.comment,
        promo_code_id=promo_code_id,
        status=BookingStatus.new,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    logger.info(
        f"Booking created: id={db_booking.id}, name={db_booking.name}, email={db_booking.email}, date={db_booking.appointment_date}"
    )

    # Отправляем уведомление визажисту
    send_booking_notification(db_booking)

    return db_booking


# Админские эндпоинты
@router.get(
    "/admin/all",
    response_model=List[BookingOut],
    dependencies=[Depends(get_current_admin_user)],
)
def get_all_bookings(
    status: Optional[BookingStatus] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    """Админ: список заявок с фильтрацией"""
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    if from_date:
        query = query.filter(Booking.appointment_date >= from_date)
    if to_date:
        query = query.filter(Booking.appointment_date <= to_date)
    return query.order_by(Booking.created_at.desc()).all()


@router.patch(
    "/admin/{booking_id}/status",
    response_model=BookingOut,
    dependencies=[Depends(get_current_admin_user)],
)
def update_booking_status(
    booking_id: int, status_update: BookingUpdateStatus, db: Session = Depends(get_db)
):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db_booking.status = status_update.status
    db.commit()
    db.refresh(db_booking)
    return db_booking
