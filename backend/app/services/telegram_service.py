import httpx
from app.core.config import settings


async def send_telegram_message(text: str, chat_id: str = None):
    """Отправка сообщения в Telegram админу"""
    if not settings.TELEGRAM_BOT_TOKEN:
        print("TELEGRAM_BOT_TOKEN не задан")
        return None

    chat_id = chat_id or settings.TELEGRAM_ADMIN_CHAT_ID

    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
        )
        return response.json()
