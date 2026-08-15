from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.calendar_appointment import (
    AppointmentStatus,
    CalendarAppointment,
    ClientSource,
    duration_for_type,
)
from app.schemas.calendar_appointment import (
    CalendarAppointmentCreate,
    CalendarAppointmentOut,
    CalendarAppointmentStatusUpdate,
    CalendarAppointmentUpdate,
)

router = APIRouter(prefix="/admin/calendar", tags=["admin-calendar"])


def _apply_update_validation(appointment: CalendarAppointment, data: CalendarAppointmentUpdate):
    payload = data.model_dump(exclude_unset=True)

    if "name" in payload and payload["name"] is not None:
        payload["name"] = payload["name"].strip()
    if "workplace" in payload and payload["workplace"] is not None:
        payload["workplace"] = payload["workplace"].strip()

    source = payload.get("client_source", appointment.client_source)
    if "client_source" in payload or "client_source_other" in payload:
        other = payload["client_source_other"] if "client_source_other" in payload else appointment.client_source_other
        if source == ClientSource.other:
            if not other or not str(other).strip():
                raise HTTPException(
                    status_code=400,
                    detail="Укажите источник при выборе «другое»",
                )
            payload["client_source_other"] = str(other).strip()
        else:
            payload["client_source_other"] = None

    has_prepayment = payload.get("has_prepayment", appointment.has_prepayment)
    price = payload.get("price", appointment.price)
    if has_prepayment:
        amount = payload.get("prepayment_amount", appointment.prepayment_amount)
        if amount is None or amount <= 0:
            raise HTTPException(status_code=400, detail="Укажите сумму предоплаты больше 0")
        if amount > price:
            raise HTTPException(
                status_code=400, detail="Предоплата не может превышать стоимость"
            )
    elif "has_prepayment" in payload:
        payload["prepayment_amount"] = None

    for key, value in payload.items():
        setattr(appointment, key, value)

    if "appointment_type" in payload or "starts_at" in payload:
        appointment.ends_at = appointment.starts_at + duration_for_type(
            appointment.appointment_type
        )


@router.get("/appointments", response_model=List[CalendarAppointmentOut])
def list_appointments(
    date_from: Optional[datetime] = Query(None, alias="from"),
    date_to: Optional[datetime] = Query(None, alias="to"),
    status: Optional[AppointmentStatus] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    query = db.query(CalendarAppointment)
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
    ends_at = body.starts_at + duration_for_type(body.appointment_type)
    appointment = CalendarAppointment(
        name=body.name.strip(),
        client_source=body.client_source,
        client_source_other=body.client_source_other,
        appointment_type=body.appointment_type,
        client_link=body.client_link,
        price=body.price,
        starts_at=body.starts_at,
        ends_at=ends_at,
        has_prepayment=body.has_prepayment,
        prepayment_amount=body.prepayment_amount,
        workplace=body.workplace.strip(),
        comment=body.comment,
        status=body.status,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.get("/appointments/{appointment_id}", response_model=CalendarAppointmentOut)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    appointment = (
        db.query(CalendarAppointment)
        .filter(CalendarAppointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return appointment


@router.patch("/appointments/{appointment_id}", response_model=CalendarAppointmentOut)
def update_appointment(
    appointment_id: int,
    body: CalendarAppointmentUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    appointment = (
        db.query(CalendarAppointment)
        .filter(CalendarAppointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    _apply_update_validation(appointment, body)
    db.commit()
    db.refresh(appointment)
    return appointment


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
    appointment = (
        db.query(CalendarAppointment)
        .filter(CalendarAppointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    appointment.status = body.status
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    appointment = (
        db.query(CalendarAppointment)
        .filter(CalendarAppointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    db.delete(appointment)
    db.commit()
    return {"ok": True, "message": "Запись удалена"}
