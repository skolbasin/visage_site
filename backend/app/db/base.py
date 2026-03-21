from app.db.base_class import Base

# Импортируем модели, чтобы Alembic их видел
from app.models.article import Article
from app.models.booking import Booking
from app.models.category import Category
from app.models.certificate import Certificate
from app.models.portfolio import PortfolioItem
from app.models.post import Post
from app.models.promo import PromoCode
from app.models.review import Review
from app.models.user import User