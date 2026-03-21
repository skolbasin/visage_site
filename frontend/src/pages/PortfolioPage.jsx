import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data } = await api.get('/portfolio/items');
      setItems(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gold mb-8">Портфолио</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-darkgray rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition transform"
            onClick={() => setSelectedItem(item)}
          >
            <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              {item.description && <p className="text-gray-400 mt-1">{item.description}</p>}
              {item.category && <span className="text-gold text-sm">{item.category.name}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-darkgray rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full h-auto" />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gold mb-2">{selectedItem.title}</h2>
              {selectedItem.description && <p className="text-gray-300">{selectedItem.description}</p>}
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-4 bg-gold text-black px-4 py-2 rounded hover:bg-yellow-500 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}