from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.telegram_service import send_telegram_message

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackRequest(BaseModel):
    message: str
    contact_type: str  # 'telegram', 'phone', 'email'
    contact_value: str


@router.post("/")
async def submit_feedback(feedback: FeedbackRequest):
    # Формируем сообщение для Telegram
    text = f"<b>Новый вопрос с сайта!</b>\n\n"
    text += f"Вопрос:\n{feedback.message}\n\n"
    text += f"Ответить через: {feedback.contact_type}\n"
    text += f"Контакт: {feedback.contact_value}"

    result = await send_telegram_message(text)

    if result and result.get("ok"):
        return {"status": "ok", "message": "Сообщение отправлено"}
    else:
        raise HTTPException(status_code=500, detail="Ошибка отправки в Telegram")
