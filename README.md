```commandline
makeup-service/
├── backend/
│   ├── app/
│   │   ├── api/               # эндпоинты (версионирование /api/v1)
│   │   │   ├── auth.py
│   │   │   ├── booking.py
│   │   │   ├── posts.py
│   │   │   ├── portfolio.py
│   │   │   ├── reviews.py
│   │   │   ├── articles.py
│   │   │   ├── certificates.py
│   │   │   └── ai.py
│   │   ├── core/              # конфигурация, безопасность, зависимости
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── models/            # SQLAlchemy модели
│   │   │   ├── user.py
│   │   │   ├── booking.py
│   │   │   ├── post.py
│   │   │   ├── portfolio.py
│   │   │   ├── review.py
│   │   │   ├── article.py
│   │   │   ├── certificate.py
│   │   │   └── promo.py
│   │   ├── schemas/           # Pydantic схемы
│   │   │   ├── user.py
│   │   │   ├── booking.py
│   │   │   └── ...
│   │   ├── services/          # бизнес-логика
│   │   │   ├── email_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── promo_service.py
│   │   │   └── certificate_service.py
│   │   ├── db/                # настройка БД
│   │   │   ├── base.py        # Base и импорты моделей
│   │   │   └── session.py
│   │   └── main.py            # точка входа FastAPI
│   ├── alembic/               # миграции
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/             # страницы (React Router)
│   │   ├── services/          # API-клиенты (axios)
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── nginx/
│   └── default.conf
└── README.md
```