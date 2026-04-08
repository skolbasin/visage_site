import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api';

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const localImages = [
    '/IMG_8514.JPG',
    '/IMG_5405.JPG',
    '/IMG_6428.PNG',
    '/IMG_7913.PNG',
    '/IMG_2578.JPG',
    '/IMG_9246.JPG',
  ];

  const filterTags = [
    { id: 'all', name: 'Все работы' },
    { id: 'nude', name: 'Нюд' },
    { id: 'smoky', name: 'Смоки' },
    { id: 'wedding', name: 'Свадебный' },
    { id: 'evening', name: 'Вечерний' },
    { id: 'day', name: 'Дневной' },
  ];

  // Исправление скролла: прокручиваем вверх при загрузке страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get('/portfolio/items');
      if (data && data.length > 0) {
        setItems(data);
      } else {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Загрузка портфолио...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="px-6 md:px-12 lg:px-20">
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
          <div className="text-center py-20"><p className="text-gray-400">Нет работ в этой категории</p></div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-96 object-cover transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                    {item.category && (
                      <span className="absolute bottom-3 left-3 bg-white/90 text-[#4a7c59] text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[#2c2c2c]">{item.title}</h3>
                    {item.description && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition">
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3">
                <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full h-auto object-contain max-h-[70vh] md:max-h-[85vh]" />
              </div>
              <div className="md:w-1/3 p-6">
                <h2 className="text-2xl font-serif font-bold text-[#2c2c2c] mb-3">{selectedItem.title}</h2>
                {selectedItem.category && (
                  <span className="inline-block bg-[#4a7c59]/10 text-[#4a7c59] px-3 py-1 rounded-full text-sm mb-4">
                    {selectedItem.category.name}
                  </span>
                )}
                {selectedItem.description && <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link to="/booking" className="btn-primary block text-center">Записаться на такой же образ</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}