from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    admin,
    ai,
    articles,
    auth,
    booking,
    certificates,
    feedback,
    portfolio,
    posts,
    promo,
)
from app.core.config import settings
from app.core.logging_settings import setup_logging
from app.core.rate_limiting import setup_rate_limit
from app.core.middleware import log_requests
import logging


# Настройка логирования (до создания приложения)
setup_logging()
logger = logging.getLogger(__name__)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# === Middleware ===

# CORS – разрешаем доступ с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,  # список из config.py
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Кастомное логирование запросов (время ответа, метод, путь)
app.middleware("http")(log_requests)

# === Rate limiting ===
if settings.RATE_LIMIT_ENABLED:
    setup_rate_limit(app)

# === Роутеры ===
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(posts.router, prefix=settings.API_V1_STR)
app.include_router(articles.router, prefix=settings.API_V1_STR)
app.include_router(booking.router, prefix=settings.API_V1_STR)
app.include_router(promo.router, prefix=settings.API_V1_STR)
app.include_router(certificates.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "Makeup Service API"}


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
