from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_admin_user, get_db
from app.models.calendar_appointment import (
    AppointmentGuest,
    AppointmentStatus,
    CalendarAppointment,
    ClientSource,
    duration_for_types,
)
from app.schemas.calendar_appointment import (
    AppointmentGuestIn,
    CalendarAppointmentCreate,
    CalendarAppointmentOut,
    CalendarAppointmentStatusUpdate,
    CalendarAppointmentUpdate,
)

router = APIRouter(prefix="/admin/calendar", tags=["admin-calendar"])


def _types_for_duration(main_type, guests: List[AppointmentGuestIn]):
    types = [main_type]
    types.extend(guest.appointment_type for guest in guests)
    return types


def _replace_guests(appointment: CalendarAppointment, guests: List[AppointmentGuestIn]):
    appointment.guests.clear()
    for guest in guests:
        appointment.guests.append(
            AppointmentGuest(
                name=guest.name.strip(),
                appointment_type=guest.appointment_type,
                price=guest.price,
            )
        )


def _recalc_ends_at(appointment: CalendarAppointment):
    guest_types = [g.appointment_type for g in appointment.guests]
    appointment.ends_at = appointment.starts_at + duration_for_types(
        [appointment.appointment_type, *guest_types]
    )


def _apply_update_validation(
    appointment: CalendarAppointment, data: CalendarAppointmentUpdate
):
    payload = data.model_dump(exclude_unset=True, exclude={"guests"})

    if "name" in payload and payload["name"] is not None:
        payload["name"] = payload["name"].strip()
    if "contact" in payload and payload["contact"] is not None:
        payload["contact"] = payload["contact"].strip()

    source = payload.get("client_source", appointment.client_source)
    if "client_source" in payload or "client_source_other" in payload:
        other = (
            payload["client_source_other"]
            if "client_source_other" in payload
            else appointment.client_source_other
        )
        if source == ClientSource.other:
            if not other or not str(other).strip():
                raise HTTPException(
                    status_code=400,
                    detail="Укажите источник при выборе «другое»",
                )
            payload["client_source_other"] = str(other).strip()
        else:
            payload["client_source_other"] = None

    guests_payload = data.guests
    if guests_payload is not None:
        _replace_guests(appointment, guests_payload)

    for key, value in payload.items():
        setattr(appointment, key, value)

    has_prepayment = appointment.has_prepayment
    if has_prepayment:
        amount = appointment.prepayment_amount
        if amount is None or amount <= 0:
            raise HTTPException(status_code=400, detail="Укажите сумму предоплаты больше 0")
        total = appointment.total_price
        if total > 0 and amount > total:
            raise HTTPException(
                status_code=400, detail="Предоплата не может превышать общую стоимость"
            )
    elif "has_prepayment" in payload:
        appointment.prepayment_amount = None

    if (
        "appointment_type" in payload
        or "starts_at" in payload
        or guests_payload is not None
    ):
        _recalc_ends_at(appointment)


def _get_appointment_or_404(db: Session, appointment_id: int) -> CalendarAppointment:
    appointment = (
        db.query(CalendarAppointment)
        .options(joinedload(CalendarAppointment.guests))
        .filter(CalendarAppointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return appointment


@router.get("/appointments", response_model=List[CalendarAppointmentOut])
def list_appointments(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    status: Optional[AppointmentStatus] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    query = db.query(CalendarAppointment).options(
        joinedload(CalendarAppointment.guests)
    )
    if date_from is not None:
        query = query.filter(CalendarAppointment.ends_at >= date_from)
    if date_to is not None:
        query = query.filter(CalendarAppointment.starts_at <= date_to)
    if status is not None:
        query = query.filter(CalendarAppointment.status == status)
    return query.order_by(CalendarAppointment.starts_at.asc()).all()


@router.post("/appointments", response_model=CalendarAppointmentOut, status_code=201)
def create_appointment(
    body: CalendarAppointmentCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    ends_at = body.starts_at + duration_for_types(
        _types_for_duration(body.appointment_type, body.guests)
    )
    appointment = CalendarAppointment(
        name=body.name.strip(),
        client_source=body.client_source,
        client_source_other=body.client_source_other,
        appointment_type=body.appointment_type,
        contact=body.contact.strip(),
        price=body.price,
        starts_at=body.starts_at,
        ends_at=ends_at,
        has_prepayment=body.has_prepayment,
        prepayment_amount=body.prepayment_amount,
        workplace=body.workplace,
        comment=body.comment,
        status=body.status,
    )
    _replace_guests(appointment, body.guests)
    db.add(appointment)
    db.commit()
    return _get_appointment_or_404(db, appointment.id)


@router.get("/appointments/{appointment_id}", response_model=CalendarAppointmentOut)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    return _get_appointment_or_404(db, appointment_id)


@router.patch("/appointments/{appointment_id}", response_model=CalendarAppointmentOut)
def update_appointment(
    appointment_id: int,
    body: CalendarAppointmentUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    appointment = _get_appointment_or_404(db, appointment_id)
    _apply_update_validation(appointment, body)
    db.commit()
    return _get_appointment_or_404(db, appointment_id)


@router.patch(
    "/appointments/{appointment_id}/status",
    response_model=CalendarAppointmentOut,
)
def update_appointment_status(
    appointment_id: int,
    body: CalendarAppointmentStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    appointment = _get_appointment_or_404(db, appointment_id)
    appointment.status = body.status
    db.commit()
    return _get_appointment_or_404(db, appointment_id)


@router.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    appointment = _get_appointment_or_404(db, appointment_id)
    db.delete(appointment)
    db.commit()
    return {"ok": True, "message": "Запись удалена"}
