import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api';
import AnimatedStars from '../components/AnimatedStars';

const portfolioItems = [
  { id: 4, image_url: '/IMG_8514.JPG', title: 'Свадебный макияж "Bridal Glow"', description: 'Сияющий свадебный образ с эффектом влажной кожи.', category: { name: 'Свадебный' } },
  { id: 9, image_url: '/IMG_7913.PNG', title: 'Смоки-айс классический', description: 'Классический дымчатый макияж для выразительного взгляда.', category: { name: 'Вечерний' } },
  { id: 15, image_url: '/IMG_9246.JPG', title: 'Макияж "Natural Glow"', description: 'Естественное сияние и здоровый вид кожи.', category: { name: 'Дневной' } },
  { id: 18, image_url: '/IMG_20260412_000019_273.jpg', title: 'Макияж для фотосессии "Nude"', description: 'Нюдовый макияж с акцентом на скульптурирование лица.', category: { name: 'Фотосессия' } },
  { id: 19, image_url: '/IMG_20260412_000019_281.jpg', title: 'Графический макияж "Стрелки"', description: 'Чёткие графические стрелки. Современный трендовый образ.', category: { name: 'Графический' } },
  { id: 20, image_url: '/IMG_20260412_000025_055.jpg', title: 'Графический макияж "Cut Crease"', description: 'Техника Cut Crease с чёткими линиями. Выразительный взгляд.', category: { name: 'Графический' } },
  { id: 21, image_url: '/IMG_20260412_000025_060.jpg', title: 'Графический макияж "Цветные акценты"', description: 'Яркие цветовые акценты в сочетании с графикой.', category: { name: 'Графический' } },
  { id: 22, image_url: '/IMG_20260412_000029_843.jpg', title: 'Коррекция лица "Скульптурирование"', description: 'Профессиональная скульптурная коррекция лица. Идеальный овал.', category: { name: 'Коррекция' } },
  { id: 23, image_url: '/IMG_20260412_000029_866.jpg', title: 'Коррекция лица "Контуринг"', description: 'Мягкий контуринг для естественного скульптурирования.', category: { name: 'Коррекция' } },
  { id: 24, image_url: '/IMG_20260412_000029_876.jpg', title: 'Коррекция лица "Свечение"', description: 'Техника стробинга — здоровое сияние кожи.', category: { name: 'Коррекция' } },
  { id: 25, image_url: '/IMG_20260412_000029_877.jpg', title: 'Макияж "Instagram-perfect"', description: 'Трендовый макияж, который собирает лайки в соцсетях.', category: { name: 'Instagram' } },
  { id: 26, image_url: '/IMG_20260412_000029_882.jpg', title: 'Макияж "Soft Pink"', description: 'Нежный розовый макияж. Мягкий и романтичный образ.', category: { name: 'Instagram' } },
  { id: 27, image_url: '/IMG_20260412_000029_885.jpg', title: 'Макияж "Peach Dream"', description: 'Персиковые оттенки для свежего и сияющего вида.', category: { name: 'Instagram' } },
  { id: 28, image_url: '/IMG_20260412_000029_890.jpg', title: 'Макияж "Berry Mood"', description: 'Ягодные оттенки в макияже. Яркий и сочный образ.', category: { name: 'Instagram' } },
  { id: 29, image_url: '/IMG_20260412_000029_891.jpg', title: 'Макияж "Chocolate Brown"', description: 'Шоколадные оттенки для тёплого цветотипа.', category: { name: 'Instagram' } },
  { id: 31, image_url: '/IMG_20260412_123932_327.jpg', title: 'Экспресс-макияж "На работу"', description: 'Сдержанный офисный макияж, который делается за 10 минут.', category: { name: 'Экспресс' } },
  { id: 32, image_url: '/IMG_20260412_123942_222.jpg', title: 'Экспресс-макияж "На свидание"', description: 'Быстрый романтичный образ с акцентом на глаза.', category: { name: 'Экспресс' } },
  { id: 33, image_url: '/IMG_20260412_123945_182.jpg', title: 'Выпускной макияж', description: 'Яркий и запоминающийся образ для выпускного вечера.', category: { name: 'Особый случай' } },
  { id: 36, image_url: '/IMG_20260412_123958_004.jpg', title: 'Макияж "Fresh Face"', description: 'Свежий минималистичный макияж для любого дня.', category: { name: 'Сезонный' } },
  { id: 38, image_url: '/IMG_5405.JPG', title: 'Макияж "Winter Berry"', description: 'Зимний ягодный макияж с насыщенными оттенками.', category: { name: 'Сезонный' } },
  { id: 39, image_url: '/IMG_6428.PNG', title: 'Классический макияж', description: 'Вневременная классика, которая подходит всем.', category: { name: 'Классика' } },
  { id: 40, image_url: '/IMG_2578.JPG', title: 'Монохромный макияж', description: 'Монохромный образ в одном цветовом решении.', category: { name: 'Классика' } },
];

const filterTags = [
  { id: 'all', name: 'Все работы' },
  { id: 'wedding', name: 'Свадебный' },
  { id: 'evening', name: 'Вечерний' },
  { id: 'day', name: 'Дневной' },
  { id: 'photosession', name: 'Фотосессия' },
  { id: 'graphic', name: 'Графический' }

];

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchPortfolio = async () => {
      try {
        const { data } = await api.get('/portfolio/items');
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(portfolioItems);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setItems(portfolioItems);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => {
        const itemCategory = item.category?.name?.toLowerCase() || '';
        switch (activeCategory) {
          case 'wedding': return itemCategory.includes('свадеб');
          case 'evening': return itemCategory.includes('вечер') || itemCategory.includes('evening');
          case 'day': return itemCategory.includes('днев') || itemCategory.includes('day');
          case 'photosession': return itemCategory.includes('фотосесс');
          case 'graphic': return itemCategory.includes('графич');
          case 'correction': return itemCategory.includes('коррекц');
          case 'express': return itemCategory.includes('экспресс');
          default: return true;
        }
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatedStars />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Загрузка портфолио...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 relative overflow-hidden">
      <AnimatedStars />

      <div className="px-6 md:px-12 lg:px-20 relative z-10">
        <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] text-center mb-4">Портфолио</h1>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
          Мои работы, вдохновение и любимые образы. Каждая фотография — это история, созданная с любовью
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filterTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveCategory(tag.id)}
              className={`px-5 py-2 rounded-full transition-all duration-300 text-sm ${
                activeCategory === tag.id
                  ? 'bg-[#4a7c59] text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#4a7c59] hover:text-[#4a7c59]'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Нет работ в этой категории</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden" style={{ height: '480px' }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                    {item.category && (
                      <span className="absolute bottom-3 left-3 bg-white/90 text-[#4a7c59] text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#2c2c2c] line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="relative max-w-6xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 bg-gray-100 flex items-center justify-center p-4">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-auto object-contain max-h-[70vh] md:max-h-[85vh] rounded-lg"
                />
              </div>
              <div className="md:w-1/3 p-6">
                <h2 className="text-2xl font-serif font-bold text-[#2c2c2c] mb-3">{selectedItem.title}</h2>
                {selectedItem.category && (
                  <span className="inline-block bg-[#4a7c59]/10 text-[#4a7c59] px-3 py-1 rounded-full text-sm mb-4">
                    {selectedItem.category.name}
                  </span>
                )}
                {selectedItem.description && (
                  <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                )}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link to="/booking" className="block w-full text-center btn-primary">
                    Записаться на такой же образ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}