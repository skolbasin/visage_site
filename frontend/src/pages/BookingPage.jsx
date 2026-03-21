import { useState } from 'react';
import api from '../services/api';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    appointment_date: '',
    ready_by_date: '',
    comment: '',
    promo_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/booking', formData);
      setMessage({ type: 'success', text: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' });
      setFormData({
        name: '',
        phone: '',
        email: '',
        appointment_date: '',
        ready_by_date: '',
        comment: '',
        promo_code: ''
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Произошла ошибка при отправке. Попробуйте позже.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gold mb-6">Запись на услугу</h1>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Имя *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Телефон *</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Дата и время записи *</label>
          <input
            type="datetime-local"
            name="appointment_date"
            required
            value={formData.appointment_date}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Дата и время готовности *</label>
          <input
            type="datetime-local"
            name="ready_by_date"
            required
            value={formData.ready_by_date}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">К какому времени вы должны быть полностью готовы</p>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Комментарий</label>
          <textarea
            name="comment"
            rows="3"
            value={formData.comment}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Промокод</label>
          <input
            type="text"
            name="promo_code"
            value={formData.promo_code}
            onChange={handleChange}
            className="w-full p-2 bg-darkgray border border-gray-700 rounded text-white focus:border-gold outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Записаться'}
        </button>
      </form>
    </div>
  );
}