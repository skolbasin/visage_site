import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_active_user,
    get_current_admin_user,
    get_db,
)
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewApprove, ReviewCreate, ReviewOut

router = APIRouter(prefix="/reviews", tags=["reviews"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[ReviewOut])
def get_reviews(
    approved_only: bool = Query(
        True, description="Для публичного доступа только одобренные"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Публичный: список одобренных отзывов"""
    query = db.query(Review)
    if approved_only:
        query = query.filter(Review.is_approved == True)
    return query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=ReviewOut)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),  # может быть None
):
    """Создание отзыва (доступно авторизованным и неавторизованным)"""
    # Определяем имя
    if current_user:
        name = current_user.full_name or current_user.email
        user_id = current_user.id
    else:
        if not review.name:
            raise HTTPException(
                status_code=400, detail="Name is required for anonymous review"
            )
        name = review.name
        user_id = None

    db_review = Review(
        user_id=user_id,
        name=name,
        text=review.text,
        rating=review.rating,
        is_approved=False,  # требует модерации
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    logger.info(f"New review added: id={db_review.id}, user={db_review.name}, rating={db_review.rating}")

    return db_review


# Админские эндпоинты для модерации
@router.get(
    "/admin/all",
    response_model=List[ReviewOut],
    dependencies=[Depends(get_current_admin_user)],
)
def get_all_reviews(
    approved: Optional[bool] = Query(None, description="Фильтр по статусу модерации"),
    db: Session = Depends(get_db),
):
    """Админ: все отзывы с возможностью фильтрации"""
    query = db.query(Review)
    if approved is not None:
        query = query.filter(Review.is_approved == approved)
    return query.order_by(Review.created_at.desc()).all()


@router.patch(
    "/{review_id}/approve",
    response_model=ReviewOut,
    dependencies=[Depends(get_current_admin_user)],
)
def approve_review(
    review_id: int, approval: ReviewApprove, db: Session = Depends(get_db)
):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    db_review.is_approved = approval.is_approved
    db.commit()
    db.refresh(db_review)
    return db_review


@router.delete("/{review_id}", dependencies=[Depends(get_current_admin_user)])
def delete_review(review_id: int, db: Session = Depends(get_db)):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return {"ok": True}
