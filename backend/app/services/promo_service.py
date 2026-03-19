import random
import string


def generate_promo_code(user_id: int) -> str:
    """Генерирует уникальный промокод вида WELCOME_USERID_RANDOM"""
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"WELCOME{user_id}{random_part}"
