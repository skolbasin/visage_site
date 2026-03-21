import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', text: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews', { params: { approved_only: true } });
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = { ...form };
      if (user) {
        delete payload.name; // имя берётся из профиля
      } else if (!payload.name) {
        setMessage({ type: 'error', text: 'Укажите имя' });
        setSubmitting(false);
        return;
      }
      await api.post('/reviews', payload);
      setMessage({ type: 'success', text: 'Спасибо! Отзыв будет опубликован после проверки.' });
      setForm({ name: '', text: '', rating: 5 });
      fetchReviews(); // обновляем список (новый отзыв появится после одобрения)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Ошибка отправки' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gold mb-6">Отзывы</h1>

      {/* Список отзывов */}
      <div className="space-y-4 mb-12">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-darkgray p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-white">{rev.name}</span>
                <div className="flex text-gold">
                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
              </div>
              <span className="text-gray-500 text-sm">{new Date(rev.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-300 mt-2">{rev.text}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-400">Пока нет отзывов. Будьте первым!</p>}
      </div>

      {/* Форма добавления */}
      <div className="bg-darkgray p-6 rounded-lg">
        <h2 className="text-xl font-bold text-gold mb-4">Оставить отзыв</h2>
        {message.text && (
          <div className={`mb-4 p-2 rounded ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {!user && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Ваше имя *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Оценка</label>
            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
            >
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} звезд{ r!==1 ? 'ы' : 'а' }</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Текст отзыва *</label>
            <textarea
              name="text"
              rows="4"
              value={form.text}
              onChange={handleChange}
              required
              className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-gold text-black px-6 py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {submitting ? 'Отправка...' : 'Отправить'}
          </button>
        </form>
      </div>
    </div>
  );
}