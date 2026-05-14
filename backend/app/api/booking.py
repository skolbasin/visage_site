import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.booking import Booking, BookingStatus
from app.models.promo import PromoCode
from app.schemas.booking import BookingCreate, BookingOut
from app.services.email_service import send_booking_notification

router = APIRouter(prefix="/booking", tags=["booking"])
logger = logging.getLogger(__name__)

send_booking_notification(
    {
        "name": booking.name,
        "phone": booking.phone,
        "email": booking.email,
        "service": booking.service_name,
        "appointment_date": booking.appointment_date.strftime("%d.%m.%Y %H:%M"),
        "promo_code": promo_code_str,
        "comment": booking.comment,
        "status": db_booking.status.value,
    }
)


@router.post("/", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
):
    """Публичный: создание заявки на запись"""
    promo_code_id = None
    promo_code_str = None

    # Проверка промокода, если указан
    if booking.promo_code:
        promo = db.query(PromoCode).filter(PromoCode.code == booking.promo_code).first()

        if not promo:
            # Промокод не найден в базе
            raise HTTPException(
                status_code=400, detail=f"Промокод '{booking.promo_code}' не существует"
            )

        if promo.is_used:
            # Промокод уже использован
            raise HTTPException(
                status_code=400,
                detail=f"Промокод '{booking.promo_code}' уже был использован",
            )

        # Проверка срока действия (если есть поле expires_at)
        if hasattr(promo, "expires_at") and promo.expires_at:
            from datetime import datetime

            if promo.expires_at < datetime.utcnow():
                raise HTTPException(
                    status_code=400, detail=f"Промокод '{booking.promo_code}' просрочен"
                )

        # Все проверки пройдены - применяем промокод
        promo_code_id = promo.id
        promo_code_str = promo.code

    db_booking = Booking(
        name=booking.name,
        phone=booking.phone,
        email=booking.email,
        service_name=booking.service_name,
        appointment_date=booking.appointment_date,
        ready_by_date=booking.ready_by_date,
        comment=booking.comment,
        promo_code_id=promo_code_id,
        status=BookingStatus.new,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    send_booking_notification(
        {
            "name": booking.name,
            "phone": booking.phone,
            "email": booking.email,
            "service": booking.service_name,
            "appointment_date": booking.appointment_date.strftime("%d.%m.%Y %H:%M"),
            "promo_code": promo_code_str,
            "comment": booking.comment,
            "status": db_booking.status.value,
        }
    )

    response = BookingOut(
        id=db_booking.id,
        name=db_booking.name,
        phone=db_booking.phone,
        email=db_booking.email,
        service_name=db_booking.service_name,
        appointment_date=db_booking.appointment_date,
        ready_by_date=db_booking.ready_by_date,
        comment=db_booking.comment,
        promo_code=promo_code_str,
        status=db_booking.status,
        created_at=db_booking.created_at,
    )

    logger.info(f"Booking created: id={db_booking.id}, promo_code={promo_code_str}")
    return response
