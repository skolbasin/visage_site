async def analyze_face(image_data: bytes) -> dict:
    """
    Отправляет изображение в OpenAI Vision API (или другой) и возвращает рекомендации.
    Для демо возвращаем заглушку.
    """
    # Здесь должна быть реальная интеграция с OpenAI
    # Пока заглушка
    return {
        "face_shape": "oval",
        "recommendations": "Вам подойдут мягкие smoky eyes и акцент на скулах.",
    }
