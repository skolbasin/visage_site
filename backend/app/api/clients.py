from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_admin_user, get_db
from app.models.client import Client, ClientEvent
from app.schemas.client import (
    ClientCreate,
    ClientEventCreate,
    ClientEventUpdate,
    ClientOut,
    ClientUpdate,
)

router = APIRouter(prefix="/admin/clients", tags=["admin-clients"])


def _get_client(db: Session, client_id: int) -> Client:
    client = (
        db.query(Client)
        .options(joinedload(Client.events))
        .filter(Client.id == client_id)
        .first()
    )
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client


@router.get("", response_model=List[ClientOut])
def list_clients(
    search: Optional[str] = Query(None),
    has_email: Optional[bool] = Query(None),
    has_instagram: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    query = db.query(Client).options(joinedload(Client.events))
    if has_email is True:
        query = query.filter(Client.email.isnot(None), Client.email != "")
    elif has_email is False:
        query = query.filter(or_(Client.email.is_(None), Client.email == ""))
    if has_instagram is True:
        query = query.filter(Client.instagram.isnot(None), Client.instagram != "")
    elif has_instagram is False:
        query = query.filter(or_(Client.instagram.is_(None), Client.instagram == ""))

    clients = query.order_by(Client.name.asc().nulls_last(), Client.id.asc()).all()
    if search:
        search_value = search.strip().casefold()
        clients = [
            item
            for item in clients
            if any(
                search_value in str(value or "").casefold()
                for value in (
                    item.name,
                    item.phone,
                    item.email,
                    item.instagram,
                    item.other_contacts,
                )
            )
        ]
    return clients


@router.post("", response_model=ClientOut, status_code=201)
def create_client(
    body: ClientCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    client = Client(
        name=body.name,
        age=body.age,
        phone=body.phone,
        instagram=body.instagram,
        email=body.email,
        other_contacts=body.other_contacts,
    )
    client.events = [
        ClientEvent(
            event_type=event.event_type,
            event_date=event.event_date,
            cost=event.cost,
            comment=event.comment,
        )
        for event in body.events
    ]
    db.add(client)
    db.commit()
    return _get_client(db, client.id)


@router.get("/{client_id}", response_model=ClientOut)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    return _get_client(db, client_id)


@router.patch("/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int,
    body: ClientUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    client = _get_client(db, client_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        if field in {"name", "phone", "instagram", "email", "other_contacts"} and value is not None:
            value = value.strip()
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return _get_client(db, client_id)


@router.delete("/{client_id}", status_code=204)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    client = _get_client(db, client_id)
    db.delete(client)
    db.commit()
    return None


@router.post("/{client_id}/events", response_model=ClientOut)
def add_client_event(
    client_id: int,
    body: ClientEventCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    client = _get_client(db, client_id)
    db.add(ClientEvent(client_id=client.id, **body.model_dump()))
    db.commit()
    return _get_client(db, client_id)


@router.patch("/{client_id}/events/{event_id}", response_model=ClientOut)
def update_client_event(
    client_id: int,
    event_id: int,
    body: ClientEventUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    client = _get_client(db, client_id)
    event = next((item for item in client.events if item.id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Событие не найдено")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    return _get_client(db, client_id)


@router.delete("/{client_id}/events/{event_id}", response_model=ClientOut)
def delete_client_event(
    client_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    client = _get_client(db, client_id)
    event = next((item for item in client.events if item.id == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Событие не найдено")
    db.delete(event)
    db.commit()
    return _get_client(db, client_id)
