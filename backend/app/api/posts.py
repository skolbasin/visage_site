from typing import List, Optional
import random
import os
import shutil
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.post import Post
from app.schemas.post import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])


# === ПУБЛИЧНЫЕ ЭНДПОИНТЫ ===

@router.get("/", response_model=List[PostOut])
def get_posts(
        published_only: bool = Query(True, description="Только опубликованные"),
        skip: int = Query(0, ge=0),
        limit: int = Query(20, ge=1, le=100),
        db: Session = Depends(get_db),
):
    """Публичный: список постов с пагинацией"""
    query = db.query(Post)
    if published_only:
        query = query.filter(Post.is_published == True)
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Публичный: получить один пост"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post or not post.is_published:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db)):
    """Публичный: увеличить счётчик лайков"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes_count += 1
    db.commit()
    db.refresh(post)
    return {"likes_count": post.likes_count}


# === АДМИНСКИЕ ЭНДПОИНТЫ ===

@router.get("/admin/posts", response_model=List[PostOut])
def get_all_posts(
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Админ: список всех постов (включая неопубликованные)"""
    return db.query(Post).order_by(Post.created_at.desc()).all()


@router.post("/admin/posts", response_model=PostOut)
def create_post(
        post: PostCreate,
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Админ: создание поста"""
    # Генерируем случайное количество лайков от 18 до 54
    if post.likes_count is None:
        post.likes_count = random.randint(18, 54)

    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.put("/admin/posts/{post_id}", response_model=PostOut)
def update_post(
        post_id: int,
        post: PostUpdate,
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Админ: обновление поста"""
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    for key, value in post.model_dump(exclude_unset=True).items():
        setattr(db_post, key, value)

    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/admin/posts/{post_id}")
def delete_post(
        post_id: int,
        db: Session = Depends(get_db),
        admin=Depends(get_current_admin_user),
):
    """Админ: удаление поста"""
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(db_post)
    db.commit()
    return {"ok": True}


@router.post("/admin/upload")
async def upload_image(
        file: UploadFile = File(...),
        admin=Depends(get_current_admin_user),
):
    """Админ: загрузка изображения для поста"""

    # Отладочная информация
    print(f"Получен файл: {file.filename}, тип: {file.content_type}")

    # Проверяем, что файл вообще передан
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Проверяем тип файла
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый тип файла: {file.content_type}. Загрузите изображение (JPEG, PNG, GIF)"
        )

    # Проверяем расширение
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемое расширение: {ext}. Разрешены: {', '.join(allowed_extensions)}"
        )

    # Создаём уникальное имя
    from datetime import datetime
    import random
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    random_num = random.randint(1000, 9999)
    new_filename = f"post_{timestamp}_{random_num}.{ext}"

    # Сохраняем в папку static/uploads
    import os
    import shutil
    upload_dir = "/images/portfolio"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, new_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        url = f"/images/portfolio/{new_filename}"
        print(f"Файл сохранён: {file_path}, URL: {url}")

        return {"url": url}

    except Exception as e:
        print(f"Ошибка сохранения: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сохранения файла: {str(e)}")