import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function QuestionModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    // Заглушка отправки
    setTimeout(() => {
      setLoading(false);
      setStatus('success');

      // Очищаем форму и сбрасываем статус через 3 секунды
      setTimeout(() => {
        setMessage('');
        setStatus(null);
        onClose();
      }, 3000);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-serif text-[#2c2c2c]">Задать вопрос</h3>
            <p className="text-sm text-gray-400 mt-1">Отвечу в течение 24 часов</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#4a7c59] transition">
            <X size={20} />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Ваш вопрос</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите ваш вопрос здесь..."
              rows="5"
              required
              className="w-full p-3 bg-[#faf8f6] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
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

        {/* Статус сообщение внутри формы */}
        {status === 'success' && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h4 className="text-xl font-serif text-[#2c2c2c] mb-2">Сообщение отправлено!</h4>
            <p className="text-gray-500 text-center">Ваше сообщение ушло в обработку. Я свяжусь с вами в ближайшее время.</p>
          </div>
        )}
      </div>
    </div>
  );
}