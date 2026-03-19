import random
import string
from datetime import datetime

from app.models.promo import PromoCode


def generate_promo_code(user_id: int) -> str:
    """Генерирует уникальный промокод вида WELCOME_USERID_RANDOM"""
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"WELCOME{user_id}{random_part}"


def apply_promo_code(code: str, db):
    """Помечает промокод как использованный и возвращает скидку"""
    promo = (
        db.query(PromoCode)
        .filter(PromoCode.code == code, PromoCode.is_used == False)
        .first()
    )
    if not promo:
        return None
    # Можно использовать одноразово
    promo.is_used = True
    promo.used_at = datetime.utcnow()
    db.commit()
    return promo.discount_percent
