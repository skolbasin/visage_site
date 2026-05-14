from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db
from app.core.dependencies import get_current_admin_user
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionOut, QuestionUpdateStatus
from app.services.email_service import send_question_notification


router = APIRouter()


# Публичный эндпоинт - создание вопроса (доступен всем)
@router.post("/questions", response_model=QuestionOut)
def create_question(question_in: QuestionCreate, db: Session = Depends(get_db)):
    """Создание нового вопроса (доступно всем без авторизации)"""
    question = Question(
        message=question_in.message,
        contact_type=question_in.contact_type,
        contact_value=question_in.contact_value,
        status="new",
    )
    db.add(question)
    db.commit()
    db.refresh(question)

    send_question_notification(
        {
            "name": question_in.name if hasattr(question_in, "name") else "Клиент",
            "contact_type": question_in.contact_type,
            "contact_value": question_in.contact_value,
            "message": question_in.message,
            "status": question.status,
        }
    )

    return question


# Админские эндпоинты (требуют авторизации)
@router.get("/admin/questions", response_model=List[QuestionOut])
def get_questions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
):
    """Админ: получение списка всех вопросов с пагинацией"""
    questions = (
        db.query(Question)
        .order_by(Question.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return questions


@router.patch("/admin/questions/{question_id}/status", response_model=QuestionOut)
def update_question_status(
    question_id: int,
    status_update: QuestionUpdateStatus,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
):
    """Админ: обновление статуса вопроса"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.status = status_update.status
    db.commit()
    db.refresh(question)
    return question


@router.delete("/admin/questions/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
):
    """Админ: удаление вопроса"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"ok": True}
