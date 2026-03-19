from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleOut, ArticleUpdate

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("/", response_model=List[ArticleOut])
def get_articles(
    published_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Публичный: список статей"""
    query = db.query(Article)
    if published_only:
        query = query.filter(Article.is_published == True)
    return query.order_by(Article.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{slug}", response_model=ArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article or not article.is_published:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post(
    "/", response_model=ArticleOut, dependencies=[Depends(get_current_admin_user)]
)
def create_article(article: ArticleCreate, db: Session = Depends(get_db)):
    existing = db.query(Article).filter(Article.slug == article.slug).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Article with this slug already exists"
        )
    db_article = Article(**article.model_dump())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article


@router.put(
    "/{article_id}",
    response_model=ArticleOut,
    dependencies=[Depends(get_current_admin_user)],
)
def update_article(
    article_id: int, article: ArticleUpdate, db: Session = Depends(get_db)
):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    for key, value in article.model_dump(exclude_unset=True).items():
        setattr(db_article, key, value)
    db.commit()
    db.refresh(db_article)
    return db_article


@router.delete("/{article_id}", dependencies=[Depends(get_current_admin_user)])
def delete_article(article_id: int, db: Session = Depends(get_db)):
    db_article = db.query(Article).filter(Article.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(db_article)
    db.commit()
    return {"ok": True}
