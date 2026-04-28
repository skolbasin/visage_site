from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_current_admin_user, get_db
from app.models.booking import Booking, BookingStatus
from app.models.post import Post
from app.schemas.booking import BookingOut, BookingUpdateStatus
from app.schemas.post import PostOut, PostCreate, PostUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


# Заявки
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
    return query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


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
    return booking


# Посты (бьюти-лента)
@router.get("/posts", response_model=List[PostOut])
def get_all_posts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    return (
        db.query(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    )


@router.post("/posts", response_model=PostOut)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/posts/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    post: PostUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin_user),
):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    for key, value in post.model_dump(exclude_unset=True).items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin_user)
):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return {"ok": True}
