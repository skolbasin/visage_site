from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.portfolio import Category, PortfolioItem
from app.schemas.portfolio import (
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    PortfolioItemCreate,
    PortfolioItemOut,
    PortfolioItemUpdate,
)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


# ---------- Категории ----------
@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    """Публичный: список всех категорий"""
    return db.query(Category).all()


@router.post(
    "/categories",
    response_model=CategoryOut,
    dependencies=[Depends(get_current_admin_user)],
)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Админ: создание категории"""
    existing = (
        db.query(Category)
        .filter((Category.name == category.name) | (Category.slug == category.slug))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Category with this name or slug already exists"
        )
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put(
    "/categories/{category_id}",
    response_model=CategoryOut,
    dependencies=[Depends(get_current_admin_user)],
)
def update_category(
    category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete(
    "/categories/{category_id}", dependencies=[Depends(get_current_admin_user)]
)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"ok": True}


# ---------- Элементы портфолио ----------
@router.get("/items", response_model=List[PortfolioItemOut])
def get_portfolio_items(
    category_id: Optional[int] = Query(None),
    published_only: bool = Query(
        True, description="Для публичного доступа показывать только опубликованные"
    ),
    db: Session = Depends(get_db),
):
    """Публичный: список работ с фильтрацией по категории"""
    query = db.query(PortfolioItem)
    if published_only:
        query = query.filter(PortfolioItem.is_published == True)
    if category_id:
        query = query.filter(PortfolioItem.category_id == category_id)
    return query.order_by(PortfolioItem.order).all()


@router.get("/items/{item_id}", response_model=PortfolioItemOut)
def get_portfolio_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not db_item or not db_item.is_published:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item


@router.post(
    "/items",
    response_model=PortfolioItemOut,
    dependencies=[Depends(get_current_admin_user)],
)
def create_portfolio_item(item: PortfolioItemCreate, db: Session = Depends(get_db)):
    db_item = PortfolioItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put(
    "/items/{item_id}",
    response_model=PortfolioItemOut,
    dependencies=[Depends(get_current_admin_user)],
)
def update_portfolio_item(
    item_id: int, item: PortfolioItemUpdate, db: Session = Depends(get_db)
):
    db_item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/items/{item_id}", dependencies=[Depends(get_current_admin_user)])
def delete_portfolio_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}
