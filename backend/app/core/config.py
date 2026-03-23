from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Настройки приложения, загружаемые из переменных окружения.
    """
    # === Основные настройки проекта ===
    PROJECT_NAME: str = "Makeup Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # === База данных ===
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: Optional[str] = None  # формируется автоматически, если не задан

    # === JWT аутентификация ===
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # === Email ===
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # === Rate limiting ===
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT: str = "100/minute"   # общий лимит на все эндпоинты
    RATE_LIMIT_AUTH: str = "5/minute"        # для логина и регистрации
    RATE_LIMIT_BOOKING: str = "10/hour"      # для создания заявок

    # === Логирование ===
    DEBUG: bool = False  # режим отладки (при True – логи в stdout, при False – в файлы)

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # React dev
        "http://localhost:5173",  # Vite dev
        "https://yourdomain.com",  # продакшн
    ]

    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Автоматически формируем URL БД, если не переопределён
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )

settings = Settings()