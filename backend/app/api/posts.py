from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.post import Post
from app.schemas.post import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/", response_model=List[PostOut])
def get_posts(
    published_only: bool = Query(
        True, description="Для публичного доступа только опубликованные"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Публичный: список постов с пагинацией (infinite scroll)"""
    query = db.query(Post)
    if published_only:
        query = query.filter(Post.is_published == True)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or not post.is_published:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post(
    "/", response_model=PostOut, dependencies=[Depends(get_current_admin_user)]
)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put(
    "/{post_id}", response_model=PostOut, dependencies=[Depends(get_current_admin_user)]
)
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    for key, value in post.model_dump(exclude_unset=True).items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}", dependencies=[Depends(get_current_admin_user)])
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return {"ok": True}
