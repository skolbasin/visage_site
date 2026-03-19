from fastapi import FastAPI
from app.core.config import settings
from app.api import auth  # импортируем роутер
# ... другие импорты позже

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Подключаем роутер аутентификации
app.include_router(auth.router, prefix=settings.API_V1_STR)

# Позже добавим другие роутеры

@app.get("/")
def root():
    return {"message": "Makeup Service API"}