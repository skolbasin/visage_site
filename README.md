# 💄 Makeup Artist Service

Веб-сервис для визажиста: онлайн-запись, портфолио, бьюти-лента, подарочные сертификаты, обучение и интеграция с AI.

---

## 🎯 Функциональность

### 🏠 Главная страница
- Hero-секция с фото
- Кнопки записи и портфолио
- Блоки:
  - О себе
  - Услуги
  - Отзывы
  - Контакты

---

### 🎨 Портфолио
- Галерея работ
- Фильтрация по категориям:
  - Нюд
  - Смоки
  - Свадьба и др.
- Модальное окно для увеличения фото

---

### 📰 Бьюти-лента
- Посты с фото / видео / текстом
- Бесконечная прокрутка (infinite scroll)

---

### 📅 Запись на услугу
- Форма с валидацией:
  - дата
  - время
  - промокод
- Отправка email мастеру
- Статусы заявок

---

### 👤 Личный кабинет
- Регистрация / вход (JWT)
- Персональный промокод 10% при регистрации

---

### 🎁 Подарочные сертификаты
- Выбор:
  - фиксированная сумма
  - конкретная услуга
- Генерация уникального кода
- Отправка на email

---

### 📚 Макияж для себя
- Статьи:
  - советы
  - техники
  - подбор косметики

---

### ⭐ Отзывы
- Добавление отзывов
- Модерация
- Рейтинг 1–5

---

### 🤖 AI-анализ фото
- Загрузка фото
- Рекомендации по типу лица *(заглушка)*

---

## 🛠 Технологии

### ⚙️ Бэкенд
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT (аутентификация)
- Pydantic (валидация)
- python-jose, passlib, bcrypt
- SMTP (email, заглушка)
- Docker + docker-compose

---

### 💻 Фронтенд
- React 18 + Vite
- React Router DOM
- Axios
- React Query *(частично используется)*
- Tailwind CSS
- Lucide React (иконки)
- Framer Motion *(опционально)*

---

## 📁 Структура проекта


```commandline
makeup-service/
├── backend/
│ ├── app/
│ │ ├── api/ # роутеры
│ │ ├── core/ # конфигурация, безопасность
│ │ ├── models/ # SQLAlchemy модели
│ │ ├── schemas/ # Pydantic схемы
│ │ ├── services/ # бизнес-логика
│ │ ├── db/ # база данных
│ │ └── main.py
│ ├── alembic/ # миграции
│ ├── requirements.txt
│ ├── Dockerfile
│ └── .env.example
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── context/
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── index.html
│ ├── package.json
│ ├── vite.config.js
│ ├── tailwind.config.js
│ ├── postcss.config.js
│ └── Dockerfile
├── nginx/
│ └── default.conf
├── docker-compose.yml
└── README.md
```

## 🚀 Запуск проекта

### 🧪 Локальная разработка (без Docker)

#### 🔹 Бэкенд

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# или
source venv/bin/activate

pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

#### 💻 Фронтенд

```bash
cd frontend
npm install
npm run dev
```
👉 Открыть: http://localhost:5173

### 🐳 Запуск через Docker (рекомендуется)
```
docker-compose up --build
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs
Frontend: http://localhost
```

## 🔧 Переменные окружения

Создайте файл .env:

```
# Database
POSTGRES_USER=makeup
POSTGRES_PASSWORD=secret
POSTGRES_DB=makeup_db
POSTGRES_SERVER=db

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Backend
DEBUG=False
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost"]

# Rate limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AUTH=5/minute
RATE_LIMIT_REVIEW=3/hour
RATE_LIMIT_BOOKING=10/hour

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
EMAILS_FROM_EMAIL=your@gmail.com
EMAILS_FROM_NAME=Makeup Artist
```


## 📚 API Эндпоинты
| Метод | Эндпоинт                | Описание             |
| ----- | ----------------------- | -------------------- |
| POST  | /api/v1/auth/register   | Регистрация          |
| POST  | /api/v1/auth/login      | Вход                 |
| POST  | /api/v1/auth/refresh    | Обновление токена    |
| GET   | /api/v1/auth/me         | Текущий пользователь |
| POST  | /api/v1/booking         | Запись               |
| GET   | /api/v1/portfolio/items | Портфолио            |
| GET   | /api/v1/posts           | Лента                |
| GET   | /api/v1/reviews         | Отзывы               |
| POST  | /api/v1/reviews         | Добавить отзыв       |
| GET   | /api/v1/articles        | Статьи               |
| GET   | /api/v1/articles/{slug} | Статья               |
| POST  | /api/v1/certificates    | Сертификаты          |
| POST  | /api/v1/ai/analyze-face | AI анализ            |



## 🎨 Особенности фронтенда

- 🌙 Тёмная тема + золотой акцент
- 📱 Полная адаптивность
- 🎞 Карусель портфолио
- 🖼 Модальные окна
- 🌊 Анимированный фон (волны)
- 🍔 Бургер-меню
- 🔍 Фильтрация
- ⏳ Спиннер загрузки
- 🔐 Axios interceptors (refresh token)

## 🚀 Планы развития
- 🤖 Реальный AI-анализ
- 💳 Онлайн-оплата
- 🛠 Админ-панель
- 🔔 Push-уведомления
- 📱 PWA версия