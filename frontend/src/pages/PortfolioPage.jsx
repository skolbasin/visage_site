import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api';
import AnimatedStars from '../components/AnimatedStars';

const filterTags = [
  { id: 'all', name: 'Все работы' },
  { id: 'wedding', name: 'Свадебный' },
  { id: 'evening', name: 'Вечерний' },
  { id: 'day', name: 'Дневной' },
  { id: 'graphic', name: 'Графический' },
  { id: 'hairstyles', name: 'Причёски' }
];

export default function PortfolioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Убираем слеш в конце URL, если он есть
  useEffect(() => {
    if (location.pathname.endsWith('/') && location.pathname !== '/') {
      navigate(location.pathname.slice(0, -1), { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchPortfolio = async () => {
      try {
        const { data } = await api.get('/portfolio/items');
        setItems(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Функция для фильтрации по категории
  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => {
        const categoryName = item.category?.name?.toLowerCase() || '';
        switch (activeCategory) {
          case 'wedding': return categoryName.includes('свадеб');
          case 'evening': return categoryName.includes('вечер');
          case 'day': return categoryName.includes('днев');
          case 'graphic': return categoryName.includes('графич');
          case 'hairstyles': return categoryName.includes('причёс');
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
                  className="group cursor-pointer overflow-hidden rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-white flex flex-col"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden flex-shrink-0">
                    <div style={{ height: '480px', width: '100%' }}>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover object-center transition duration-700 group-hover:scale-110"
                      />
                    </div>
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

      {/* Модальное окно */}
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
              <div className="md:w-2/3 bg-gray-100 flex items-center justify-center p-3 md:p-4">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-auto object-contain max-h-[40vh] md:max-h-[85vh] rounded-lg"
                />
              </div>

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