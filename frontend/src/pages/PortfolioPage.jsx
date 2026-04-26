import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api';
import AnimatedStars from '../components/AnimatedStars';

const portfolioItems = [
  {
    id: 1,
    image_url: '/portfolio/1.JPG',
    title: 'Гладкий пучок "в стиле Роузи"',
    description: 'Элегантный и безупречно гладкий пучок, идеально подходящий для особых случаев и фотосессий.',
    category: { name: 'Причёски' }
  },
  {
    id: 2,
    image_url: '/portfolio/2.jpg',
    title: 'Свадебный макияж в натуральных оттенках',
    description: 'Нежный и естественный свадебный образ, подчёркивающий вашу природную красоту.',
    category: { name: 'Свадебный' }
  },
  {
    id: 3,
    image_url: '/portfolio/3.JPG',
    title: 'Вечерний макияж в стиле "Hollywood"',
    description: 'Классический голливудский образ с акцентом на глаза и сияющую кожу.',
    category: { name: 'Вечерний' }
  },
  {
    id: 4,
    image_url: '/portfolio/4.jpg',
    title: 'Макияж без макияжа "Nude"',
    description: 'Невероятно естественный макияж.',
    category: { name: 'Свадебный' }
  },
  {
    id: 5,
    image_url: '/portfolio/5.jpg',
    title: 'Свадебный графичный макияж',
    description: 'Современный свадебный образ с чёткими графичными линиями и акцентами.',
    category: { name: 'Свадебный' }
  },
  {
    id: 6,
    image_url: '/portfolio/6.jpg',
    title: 'Сияющий макияж "Bridal"',
    description: 'Идеальный сияющий свадебный макияж, который будет великолепно смотреться на фото.',
    category: { name: 'Свадебный' }
  },
  {
    id: 7,
    image_url: '/portfolio/7.jpg',
    title: 'Средний пучок',
    description: 'Элегантная и универсальная укладка "средний пучок", подходящая для невест и выпускниц.',
    category: { name: 'Причёски' }
  },
  {
    id: 8,
    image_url: '/portfolio/8.jpg',
    title: 'Вечерний сияющий Smokey',
    description: 'Сияющий дымчатый макияж для вечерних мероприятий и фотосессий.',
    category: { name: 'Вечерний' }
  },
  {
    id: 9,
    image_url: '/portfolio/9.jpg',
    title: 'Макияж в оттенках Burgundy',
    description: 'Богатый и глубокий образ с использованием благородных бордовых оттенков.',
    category: { name: 'Вечерний' }
  },
  {
    id: 10,
    image_url: '/portfolio/10.jpg',
    title: 'Выразительный "Glow makeup"',
    description: 'Максимально выразительный образ с интенсивным сиянием кожи.',
    category: { name: 'Вечерний' }
  },
  {
    id: 11,
    image_url: '/portfolio/11.jpg',
    title: 'Макияж "Instagram-perfect"',
    description: 'Трендовый макияж, созданный специально для идеальных кадров в Instagram.',
    category: { name: 'Графический' }
  },
  {
    id: 12,
    image_url: '/portfolio/12.jpg',
    title: 'Макияж "Soft Pink"',
    description: 'Нежный, воздушный макияж в мягких розовых тонах.',
    category: { name: 'Вечерний' }
  },
  {
    id: 13,
    image_url: '/portfolio/13.jpg',
    title: 'Макияж "Peach Dream"',
    description: 'Свежий, сияющий макияж с персиковыми акцентами.',
    category: { name: 'Вечерний' }
  },
  {
    id: 14,
    image_url: '/portfolio/14.jpg',
    title: 'Макияж "Berry Mood"',
    description: 'Яркий, сочный макияж с использованием ягодных оттенков.',
    category: { name: 'Вечерний' }
  },
  {
    id: 15,
    image_url: '/portfolio/15.jpg',
    title: 'Макияж "Latte Smokey"',
    description: 'Тёплый и глубокий дымчатый макияж в оттенках латте.',
    category: { name: 'Графический' }
  },
  {
    id: 16,
    image_url: '/portfolio/16.jpg',
    title: 'Естественный макияж "Natural makeup"',
    description: 'Естественный и свежий образ для повседневной жизни.',
    category: { name: 'Дневной' }
  },
  {
    id: 17,
    image_url: '/portfolio/34.PNG',
    title: 'Крупные подвижные волны',
    description: 'Романтичная и объёмная укладка с крупными, подвижными локонами.',
    category: { name: 'Причёски' }
  },
  {
    id: 18,
    image_url: '/portfolio/18.JPG',
    title: 'Свадебный макияж в стиле "Old money"',
    description: 'Изысканный и сдержанный свадебный макияж в стиле "Old money".',
    category: { name: 'Свадебный' }
  },
  {
    id: 19,
    image_url: '/portfolio/19.jpg',
    title: 'Вечерний сияющий макияж "Pink glow"',
    description: 'Нежный сияющий розовый макияж, идеально подходящий для вечерних мероприятий и фотосессий.',
    category: { name: 'Вечерний' }
  },
  {
    id: 20,
    image_url: '/portfolio/20.jpg',
    title: 'Матовый макияж "Brown smokey"',
    description: 'Глубокий и выразительный матовый дымчатый макияж в коричневых тонах.',
    category: { name: 'Вечерний' }
  },
  {
    id: 21,
    image_url: '/portfolio/21.jpg',
    title: 'Сияющий макияж невесты и прическа "Мальвинка"',
    description: 'Нежный сияющий образ для невесты в сочетании с романтичной прической "Мальвинка".',
    category: { name: 'Свадебный' }
  },
  {
    id: 22,
    image_url: '/portfolio/22.jpg',
    title: 'Свадебный образ в естественных оттенках и гладкий низкий пучок',
    description: 'Элегантный и естественный свадебный образ с гладким низким пучком.',
    category: { name: 'Свадебный' }
  },
  {
    id: 23,
    image_url: '/portfolio/23.jpg',
    title: 'Образ на утро невесты с натуральным макияжем и прической "Мальвинка"',
    description: 'Нежный и натуральный образ для утра невесты в сочетании с прической "Мальвинка".',
    category: { name: 'Свадебный' }
  },
  {
    id: 24,
    image_url: '/portfolio/24.jpg',
    title: 'Образ невесты с гладким пучком',
    description: 'Изысканный свадебный образ с элегантным гладким пучком.',
    category: { name: 'Свадебный' }
  },
  {
    id: 25,
    image_url: '/portfolio/25.jpg',
    title: 'Выразительный макияж "Soft make"',
    description: 'Мягкий и выразительный макияж, подходящий как для дневных, так и для свадебных образов.',
    category: { name: 'Дневной' }
  },
  {
    id: 26,
    image_url: '/portfolio/26.jpg',
    title: 'Образ на роспись в персиковых оттенках',
    description: 'Нежный и свежий образ для росписи в тёплых персиковых тонах.',
    category: { name: 'Свадебный' }
  },
  {
    id: 27,
    image_url: '/portfolio/27.jpg',
    title: 'Натуральный макияж + крупные локоны',
    description: 'Естественный макияж в сочетании с объёмными крупными локонами.',
    category: { name: 'Свадебный' }
  },
  {
    id: 28,
    image_url: '/portfolio/28.JPG',
    title: 'Голливудская укладка',
    description: 'Классическая голливудская укладка с объёмными волнами.',
    category: { name: 'Причёски' }
  },
  {
    id: 29,
    image_url: '/portfolio/29.PNG',
    title: 'Низкий хвост из волн',
    description: 'Элегантный низкий хвост, собранный из красивых волн.',
    category: { name: 'Причёски' }
  },
  {
    id: 30,
    image_url: '/portfolio/30.JPG',
    title: 'Высокий гладкий хвост',
    description: 'Стильный и строгий высокий гладкий хвост для особых случаев.',
    category: { name: 'Причёски' }
  },
  {
    id: 31,
    image_url: '/portfolio/31.JPG',
    title: 'Низкий пучок из прямых волос',
    description: 'Лаконичный и элегантный низкий пучок из прямых волос.',
    category: { name: 'Причёски' }
  },
  {
    id: 32,
    image_url: '/portfolio/32.JPG',
    title: 'Прическа "Ракушка"',
    description: 'Изысканная вечерняя прическа "Ракушка", подходящая для торжественных мероприятий.',
    category: { name: 'Причёски' }
  },
  {
    id: 33,
    image_url: '/portfolio/33.JPG',
    title: 'Прическа "Мальвинка"',
    description: 'Романтичная и нежная прическа "Мальвинка", которая подчеркнёт ваш образ.',
    category: { name: 'Причёски' }
  }
];

const filterTags = [
  { id: 'all', name: 'Все работы' },
  { id: 'wedding', name: 'Свадебный' },
  { id: 'evening', name: 'Вечерний' },
  { id: 'day', name: 'Дневной' },
  { id: 'graphic', name: 'Графический' },
  { id: 'hairstyles', name: 'Причёски' }
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
          case 'graphic': return itemCategory.includes('графич');
          case 'hairstyles': return itemCategory.includes('причёс');
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
    <div className="min-h-screen bg-white py-8 md:py-12 relative overflow-hidden">
      <AnimatedStars />

      <div className="px-4 md:px-12 lg:px-20 relative z-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2c2c2c] text-center mb-4">Портфолио</h1>
        <p className="text-gray-500 text-center mb-8 md:mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Мои работы, вдохновение и любимые образы. Каждая фотография — это история, созданная с любовью
        </p>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {filterTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveCategory(tag.id)}
              className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full transition-all duration-300 text-xs md:text-sm ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer overflow-hidden rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden" style={{ height: '380px' }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                    {item.category && (
                      <span className="absolute bottom-3 left-3 bg-white/90 text-[#4a7c59] text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 font-medium">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-base md:text-lg font-semibold text-[#2c2c2c] line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-500 text-xs md:text-sm mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно с адаптивом */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 md:p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-[95%] md:max-w-6xl bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white rounded-full p-1.5 md:p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition"
            >
              <X size={18} className="md:w-6 md:h-6" />
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto">
              {/* Изображение */}
              <div className="md:w-2/3 bg-gray-100 flex items-center justify-center p-3 md:p-4">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-auto object-contain max-h-[40vh] md:max-h-[85vh] rounded-lg"
                />
              </div>

              {/* Информация */}
              <div className="md:w-1/3 p-4 md:p-6 flex flex-col">
                <h2 className="text-lg md:text-2xl font-serif font-bold text-[#2c2c2c] mb-2 md:mb-3">
                  {selectedItem.title}
                </h2>
                {selectedItem.category && (
                  <span className="inline-block bg-[#4a7c59]/10 text-[#4a7c59] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm mb-3 md:mb-4 w-fit">
                    {selectedItem.category.name}
                  </span>
                )}
                {selectedItem.description && (
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
                  <Link
                    to="/booking"
                    className="block w-full text-center btn-primary text-sm md:text-base py-2 md:py-3"
                    onClick={() => setSelectedItem(null)}
                  >
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