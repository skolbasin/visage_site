from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_current_admin_user, get_db
from app.models.booking import Booking, BookingStatus
from app.models.promo import PromoCode
from app.schemas.booking import BookingOut, BookingUpdateStatus
from app.models.question import Question
from app.models.certificate import Certificate, CertificateStatus

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/bookings", response_model=List[BookingOut])
def get_all_bookings(
    status: Optional[BookingStatus] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)

    bookings = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for booking in bookings:
        promo_code_str = None
        if booking.promo_code_id:
            promo = db.query(PromoCode).filter(PromoCode.id == booking.promo_code_id).first()
            if promo:
                promo_code_str = promo.code

        result.append(BookingOut(
            id=booking.id,
            name=booking.name,
            phone=booking.phone,
            email=booking.email,
            service_name=booking.service_name,
            appointment_date=booking.appointment_date,
            ready_by_date=booking.ready_by_date,
            comment=booking.comment,
            promo_code=promo_code_str,
            status=booking.status,
            created_at=booking.created_at,
        ))

    return result


@router.patch("/bookings/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    status_update: BookingUpdateStatus,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = status_update.status
    db.commit()
    db.refresh(booking)

    promo_code_str = None
    if booking.promo_code_id:
        promo = db.query(PromoCode).filter(PromoCode.id == booking.promo_code_id).first()
        if promo:
            promo_code_str = promo.code

    return BookingOut(
        id=booking.id,
        name=booking.name,
        phone=booking.phone,
        email=booking.email,
        service_name=booking.service_name,
        appointment_date=booking.appointment_date,
        ready_by_date=booking.ready_by_date,
        comment=booking.comment,
        promo_code=promo_code_str,
        status=booking.status,
        created_at=booking.created_at,
    )


@router.get("/counts")
def get_new_counts(
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user)
):
    new_bookings = db.query(Booking).filter(Booking.status == BookingStatus.new).count()
    new_questions = db.query(Question).filter(Question.status == 'new').count()
    active_certificates = db.query(Certificate).filter(Certificate.status == CertificateStatus.active).count()

    return {
        "bookings": new_bookings,
        "questions": new_questions,
        "certificates": active_certificates,
    }