import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Tag } from 'lucide-react';
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
      await api.post('/booking', formData);
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
      const errorMsg = error.response?.data?.detail || 'Произошла ошибка при отправке. Попробуйте позже.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-[#2c2c2c] text-center mb-4">Запись на услугу</h1>
        <p className="text-gray-500 text-center mb-8">Заполните форму, и я свяжусь с вами для подтверждения</p>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" name="name" required placeholder="Ваше имя" value={formData.name} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="tel" name="phone" required placeholder="Телефон" value={formData.phone} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="email" name="email" required placeholder="Email" value={formData.email} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="datetime-local" name="appointment_date" required value={formData.appointment_date} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
          </div>

          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="datetime-local" name="ready_by_date" required value={formData.ready_by_date} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
            <p className="text-xs text-gray-400 mt-1 ml-10">К какому времени вы должны быть полностью готовы</p>
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea name="comment" rows="3" placeholder="Комментарий" value={formData.comment} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none" />
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" name="promo_code" placeholder="Промокод" value={formData.promo_code} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3 text-lg">
            {loading ? 'Отправка...' : 'Записаться'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          После отправки заявки я свяжусь с вами для подтверждения времени
        </p>
      </div>
    </div>
  );
}