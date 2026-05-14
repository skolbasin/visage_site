import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.portfolio import PortfolioItem

portfolio_items = [
    {
        "image_url": "/portfolio/1.jpg",
        "title": 'Гладкий пучок "в стиле Роузи"',
        "description": "Элегантный и безупречно гладкий пучок, идеально подходящий для особых случаев и фотосессий.",
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/2.jpg",
        "title": "Свадебный макияж в натуральных оттенках",
        "description": "Нежный и естественный свадебный образ, подчёркивающий вашу природную красоту.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/3.jpg",
        "title": 'Вечерний макияж в стиле "Hollywood"',
        "description": "Классический голливудский образ с акцентом на глаза и сияющую кожу.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/4.jpg",
        "title": 'Макияж без макияжа "Nude"',
        "description": "Невероятно естественный макияж.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/5.jpg",
        "title": "Свадебный графичный макияж",
        "description": "Современный свадебный образ с чёткими графичными линиями и акцентами.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/6.jpg",
        "title": 'Сияющий макияж "Bridal"',
        "description": "Идеальный сияющий свадебный макияж, который будет великолепно смотреться на фото.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/7.jpg",
        "title": "Средний пучок",
        "description": 'Элегантная и универсальная укладка "средний пучок", подходящая для невест и выпускниц.',
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/8.jpg",
        "title": "Вечерний сияющий Smokey",
        "description": "Сияющий дымчатый макияж для вечерних мероприятий и фотосессий.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/9.jpg",
        "title": "Макияж в оттенках Burgundy",
        "description": "Богатый и глубокий образ с использованием благородных бордовых оттенков.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/10.jpg",
        "title": 'Выразительный "Glow makeup"',
        "description": "Максимально выразительный образ с интенсивным сиянием кожи.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/11.jpg",
        "title": 'Макияж "Instagram-perfect"',
        "description": "Трендовый макияж, созданный специально для идеальных кадров в Instagram.",
        "category_name": "Графический",
    },
    {
        "image_url": "/portfolio/12.jpg",
        "title": 'Макияж "Soft Pink"',
        "description": "Нежный, воздушный макияж в мягких розовых тонах.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/13.jpg",
        "title": 'Макияж "Peach Dream"',
        "description": "Свежий, сияющий макияж с персиковыми акцентами.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/14.jpg",
        "title": 'Макияж "Berry Mood"',
        "description": "Яркий, сочный макияж с использованием ягодных оттенков.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/15.jpg",
        "title": 'Макияж "Latte Smokey"',
        "description": "Тёплый и глубокий дымчатый макияж в оттенках латте.",
        "category_name": "Графический",
    },
    {
        "image_url": "/portfolio/16.jpg",
        "title": 'Естественный макияж "Natural makeup"',
        "description": "Естественный и свежий образ для повседневной жизни.",
        "category_name": "Дневной",
    },
    {
        "image_url": "/portfolio/34.png",
        "title": "Крупные подвижные волны",
        "description": "Романтичная и объёмная укладка с крупными, подвижными локонами.",
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/18.jpg",
        "title": 'Свадебный макияж в стиле "Old money"',
        "description": 'Изысканный и сдержанный свадебный макияж в стиле "Old money".',
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/19.jpg",
        "title": 'Вечерний сияющий макияж "Pink glow"',
        "description": "Нежный сияющий розовый макияж, идеально подходящий для вечерних мероприятий и фотосессий.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/20.jpg",
        "title": 'Матовый макияж "Brown smokey"',
        "description": "Глубокий и выразительный матовый дымчатый макияж в коричневых тонах.",
        "category_name": "Вечерний",
    },
    {
        "image_url": "/portfolio/21.jpg",
        "title": 'Сияющий макияж невесты и прическа "Мальвинка"',
        "description": 'Нежный сияющий образ для невесты в сочетании с романтичной прической "Мальвинка".',
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/22.jpg",
        "title": "Свадебный образ в естественных оттенках и гладкий низкий пучок",
        "description": "Элегантный и естественный свадебный образ с гладким низким пучком.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/23.jpg",
        "title": 'Образ на утро невесты с натуральным макияжем и прической "Мальвинка"',
        "description": 'Нежный и натуральный образ для утра невесты в сочетании с прической "Мальвинка".',
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/24.jpg",
        "title": "Образ невесты с гладким пучком",
        "description": "Изысканный свадебный образ с элегантным гладким пучком.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/25.jpg",
        "title": 'Выразительный макияж "Soft make"',
        "description": "Мягкий и выразительный макияж, подходящий как для дневных, так и для свадебных образов.",
        "category_name": "Дневной",
    },
    {
        "image_url": "/portfolio/26.jpg",
        "title": "Образ на роспись в персиковых оттенках",
        "description": "Нежный и свежий образ для росписи в тёплых персиковых тонах.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/27.jpg",
        "title": "Натуральный макияж + крупные локоны",
        "description": "Естественный макияж в сочетании с объёмными крупными локонами.",
        "category_name": "Свадебный",
    },
    {
        "image_url": "/portfolio/28.jpg",
        "title": "Голливудская укладка",
        "description": "Классическая голливудская укладка с объёмными волнами.",
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/29.png",
        "title": "Низкий хвост из волн",
        "description": "Элегантный низкий хвост, собранный из красивых волн.",
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/30.jpg",
        "title": "Высокий гладкий хвост",
        "description": "Стильный и строгий высокий гладкий хвост для особых случаев.",
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/31.jpg",
        "title": "Низкий пучок из прямых волос",
        "description": "Лаконичный и элегантный низкий пучок из прямых волос.",
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/32.jpg",
        "title": 'Прическа "Ракушка"',
        "description": 'Изысканная вечерняя прическа "Ракушка", подходящая для торжественных мероприятий.',
        "category_name": "Причёски",
    },
    {
        "image_url": "/portfolio/33.jpg",
        "title": 'Прическа "Мальвинка"',
        "description": 'Романтичная и нежная прическа "Мальвинка", которая подчеркнёт ваш образ.',
        "category_name": "Причёски",
    },
]


def seed_portfolio():
    db = SessionLocal()

    # Получаем категории из БД
    categories = {cat.name: cat.id for cat in db.query(Category).all()}

    # Проверяем, есть ли уже записи
    existing_count = db.query(PortfolioItem).count()
    if existing_count > 0:
        print(f"⚠️ В БД уже есть {existing_count} записей. Пропускаем...")
        db.close()
        return

    # Добавляем элементы портфолио
    count = 0
    for item in portfolio_items:
        category_id = categories.get(item["category_name"])
        if not category_id:
            print(f"❌ Категория '{item['category_name']}' не найдена!")
            continue

        db_item = PortfolioItem(
            image_url=item["image_url"],
            title=item["title"],
            description=item["description"],
            category_id=category_id,
            is_published=True,
            order=count,
        )
        db.add(db_item)
        count += 1
        print(f"✅ Добавлено: {item['title']}")

    db.commit()
    db.close()
    print(f"\n🎉 Готово! Добавлено {count} элементов портфолио.")


if __name__ == "__main__":
    seed_portfolio()
