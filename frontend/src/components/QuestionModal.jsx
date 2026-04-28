import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function QuestionModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [contactType, setContactType] = useState('telegram'); // 'telegram', 'phone', 'email'
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !contactValue.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      await api.post('/feedback', {
        message: message.trim(),
        contact_type: contactType,
        contact_value: contactValue.trim(),
      });
      setStatus('success');
      setTimeout(() => {
        setMessage('');
        setContactType('telegram');
        setContactValue('');
        setStatus(null);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-serif text-[#2c2c2c]">Задать вопрос</h3>
            <p className="text-sm text-gray-400 mt-1">Отвечу в течение 24 часов</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#4a7c59] transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Ваш вопрос</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите ваш вопрос здесь..."
              rows="4"
              required
              className="w-full p-3 bg-[#faf8f6] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Куда ответить?</label>
            <div className="flex gap-2 mb-3">
              {[
                { id: 'telegram', label: 'Telegram', icon: '📱' },
                { id: 'phone', label: 'Телефон', icon: '📞' },
                { id: 'email', label: 'Email', icon: '✉️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setContactType(opt.id)}
                  className={`flex-1 py-2 rounded-lg border transition ${
                    contactType === opt.id
                      ? 'bg-[#4a7c59] text-white border-[#4a7c59]'
                      : 'border-gray-200 text-gray-600 hover:border-[#4a7c59]'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <input
              type={contactType === 'email' ? 'email' : 'text'}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={
                contactType === 'telegram' ? '@username или ссылка' :
                contactType === 'phone' ? '+7 (___) ___-__-__' :
                'example@mail.ru'
              }
              required
              className="w-full p-3 bg-[#faf8f6] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim() || !contactValue.trim()}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send size={18} />
                Отправить вопрос
              </>
            )}
          </button>
        </form>

        {status === 'success' && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-xl font-serif text-[#2c2c2c] mb-2">Сообщение отправлено!</h4>
            <p className="text-gray-500 text-center">Я свяжусь с вами в ближайшее время.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h4 className="text-xl font-serif text-[#2c2c2c] mb-2">Ошибка</h4>
            <p className="text-gray-500 text-center">Не удалось отправить. Попробуйте позже.</p>
          </div>
        )}
      </div>
    </div>
  );
}