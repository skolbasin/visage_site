import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Filter } from 'lucide-react';
import api from '../services/api';

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Массив с локальными фото (на случай если API не работает)
  const localImages = [
    '/IMG_8514.JPG',
    '/IMG_5405.JPG',
    '/IMG_6428.PNG',
    '/IMG_7913.PNG',
    '/IMG_2578.JPG',
    '/IMG_9246.JPG',
  ];

  // Теги/категории для фильтрации (можно заменить на реальные из API)
  const filterTags = [
    { id: 'all', name: 'Все работы', icon: '✨' },
    { id: 'nude', name: 'Нюд', icon: '🌸' },
    { id: 'smoky', name: 'Смоки', icon: '🌙' },
    { id: 'wedding', name: 'Свадебный', icon: '💍' },
    { id: 'evening', name: 'Вечерний', icon: '✨' },
    { id: 'day', name: 'Дневной', icon: '☀️' },
  ];

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get('/portfolio/items');
      // Если API вернул данные, используем их, иначе используем локальные
      if (data && data.length > 0) {
        setItems(data);
        // Извлекаем уникальные категории из данных
        const uniqueCategories = [...new Set(data.map(item => item.category?.name).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        // Заглушка: создаём элементы из локальных фото
        const mockItems = localImages.map((img, idx) => ({
          id: idx,
          title: `Работа ${idx + 1}`,
          description: 'Красивый образ для особого случая',
          image_url: img,
          category: { name: filterTags[(idx % 5) + 1]?.name || 'Нюд' }
        }));
        setItems(mockItems);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Заглушка при ошибке API
      const mockItems = localImages.map((img, idx) => ({
        id: idx,
        title: `Работа ${idx + 1}`,
        description: 'Красивый образ для особого случая',
        image_url: img,
        category: { name: filterTags[(idx % 5) + 1]?.name || 'Нюд' }
      }));
      setItems(mockItems);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация элементов по выбранной категории
  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => {
        const itemCategory = item.category?.name?.toLowerCase() || '';
        return itemCategory.includes(activeCategory.toLowerCase()) ||
               (activeCategory === 'nude' && itemCategory.includes('нюд')) ||
               (activeCategory === 'smoky' && itemCategory.includes('смоки')) ||
               (activeCategory === 'wedding' && (itemCategory.includes('свадеб') || itemCategory.includes('wedding'))) ||
               (activeCategory === 'evening' && (itemCategory.includes('вечер') || itemCategory.includes('evening'))) ||
               (activeCategory === 'day' && (itemCategory.includes('днев') || itemCategory.includes('day')));
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка портфолио...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок по центру */}
        <h1 className="text-4xl md:text-5xl font-bold text-gold text-center mb-4">
          Портфолио
        </h1>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Мои работы, вдохновение и любимые образы. Каждая фотография — это история, созданная с любовью
        </p>

        {/* Фильтры по тегам */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filterTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveCategory(tag.id)}
              className={`
                px-5 py-2 rounded-full transition-all duration-300 flex items-center gap-2
                ${activeCategory === tag.id
                  ? 'bg-gold text-black shadow-lg scale-105'
                  : 'bg-darkgray/50 text-gray-400 hover:text-gold hover:bg-darkgray border border-gray-700'
                }
              `}
            >
              <span className="text-lg">{tag.icon}</span>
              <span className="font-medium">{tag.name}</span>
            </button>
          ))}
        </div>

        {/* Галерея */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Нет работ в этой категории</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="group relative bg-darkgray rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                onClick={() => setSelectedItem(item)}
              >
                {/* Контейнер с изображением */}
                <div className="relative overflow-hidden h-72">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Оверлей при наведении */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Категория на карточке */}
                  {item.category && (
                    <span className="absolute bottom-3 left-3 bg-gold/90 text-black text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {item.category.name}
                    </span>
                  )}
                </div>

                {/* Информация */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно с улучшенной анимацией */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-darkgray rounded-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-gold hover:text-black transition-all duration-300"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              {/* Изображение */}
              <div className="md:w-2/3 bg-black/50">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain max-h-[70vh] md:max-h-[85vh]"
                />
              </div>

              {/* Информация */}
              <div className="md:w-1/3 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gold mb-3">{selectedItem.title}</h2>
                  {selectedItem.category && (
                    <span className="inline-block bg-gold/20 text-gold px-3 py-1 rounded-full text-sm mb-4">
                      {selectedItem.category.name}
                    </span>
                  )}
                  {selectedItem.description && (
                    <p className="text-gray-300 leading-relaxed">{selectedItem.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <Link
                    to="/booking"
                    onClick={() => setSelectedItem(null)}
                    className="btn-primary w-full text-center block"
                  >
                    Записаться на такой же образ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Добавляем стили для анимаций */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}