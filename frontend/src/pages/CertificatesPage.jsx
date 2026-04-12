import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sparkles, Calendar, Mail, User, MessageSquare, Tag, CreditCard, CheckCircle, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Список услуг (такой же, как в записи)
const servicesList = [
  'Свадебный макияж',
  'Вечерний макияж',
  'Дневной макияж',
  'Макияж для фотосессии',
  'Экспресс-макияж',
  'Выпускной макияж',
  'Обучение макияжу',
  'Комплексный образ (макияж + прическа)',
];

export default function CertificatesPage() {
  const { user } = useAuth();
  const [type, setType] = useState('fixed_amount');
  const [amount, setAmount] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [buyerName, setBuyerName] = useState(user?.full_name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [certificateCode, setCertificateCode] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);

  // Анимация при загрузке
  useEffect(() => {
    setAnimateCard(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        type,
        amount: type === 'fixed_amount' ? parseFloat(amount) : null,
        service_description: type === 'specific_service' ? serviceDescription : null,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        recipient_name: recipientName,
        message: message || null,
        expires_at: expiresAt || null,
      };
      const { data } = await api.post('/certificates', payload);
      setResult({ success: true, code: data.code });
      setCertificateCode(data.code);
      // Показываем анимацию успеха
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setResult({ success: false, error: error.response?.data?.detail || 'Ошибка оформления' });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [1000, 2000, 3000, 5000, 10000];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Анимированный заголовок */}
        <div className={`text-center mb-12 transition-all duration-700 transform ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4 animate-pulse">
            <Gift className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Подарочный сертификат</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Сделайте близкому человеку незабываемый подарок — красоту и стиль</p>
        </div>

        {/* Анимация результата */}
        {result && result.success && (
          <div className={`mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 transition-all duration-500 transform translate-y-0 opacity-100`}>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 animate-bounce" />
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Сертификат успешно оформлен!</h3>
                <p className="text-gray-600 mb-3">Код сертификата: <span className="text-[#4a7c59] font-mono text-lg font-bold">{certificateCode}</span></p>
                <p className="text-gray-500">Мы отправили его на email <strong>{buyerEmail}</strong>.</p>
              </div>
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 animate-shake">
            <p className="text-red-600">{result.error}</p>
          </div>
        )}

        {/* Анимированная форма */}
        <form onSubmit={handleSubmit} className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-500 delay-100 transform ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="p-6 md:p-8 space-y-6">
            {/* Выбор типа сертификата */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('fixed_amount')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  type === 'fixed_amount'
                    ? 'border-[#4a7c59] bg-[#4a7c59]/5 shadow-md'
                    : 'border-gray-200 hover:border-[#4a7c59]/50 hover:bg-gray-50'
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 transition-all duration-300 ${type === 'fixed_amount' ? 'text-[#4a7c59] scale-110' : 'text-gray-400'}`} />
                <p className={`font-medium ${type === 'fixed_amount' ? 'text-[#4a7c59]' : 'text-gray-500'}`}>Фиксированная сумма</p>
              </button>
              <button
                type="button"
                onClick={() => setType('specific_service')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  type === 'specific_service'
                    ? 'border-[#4a7c59] bg-[#4a7c59]/5 shadow-md'
                    : 'border-gray-200 hover:border-[#4a7c59]/50 hover:bg-gray-50'
                }`}
              >
                <Tag className={`w-6 h-6 mx-auto mb-2 transition-all duration-300 ${type === 'specific_service' ? 'text-[#4a7c59] scale-110' : 'text-gray-400'}`} />
                <p className={`font-medium ${type === 'specific_service' ? 'text-[#4a7c59]' : 'text-gray-500'}`}>Конкретная услуга</p>
              </button>
            </div>

            {/* Сумма сертификата */}
            {type === 'fixed_amount' && (
              <div className="space-y-3 animate-fadeIn">
                <label className="block text-gray-700 text-sm font-medium">Сумма сертификата</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {quickAmounts.map((sum, idx) => (
                    <button
                      key={sum}
                      type="button"
                      onClick={() => setAmount(sum.toString())}
                      className={`px-4 py-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
                        Number(amount) === sum
                          ? 'bg-[#4a7c59] text-white border-[#4a7c59] shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-[#4a7c59] hover:bg-gray-50'
                      }`}
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      {sum} ₽
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Или введите другую сумму"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm"
                />
              </div>
            )}

            {/* Выбор конкретной услуги (выпадающий список) */}
            {type === 'specific_service' && (
              <div className="animate-fadeIn">
                <label className="block text-gray-700 text-sm font-medium mb-2">Выберите услугу</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 flex justify-between items-center hover:shadow-sm"
                  >
                    <span className={serviceDescription ? 'text-gray-700' : 'text-gray-400'}>
                      {serviceDescription || 'Выберите услугу из списка'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto animate-fadeIn">
                      {servicesList.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setServiceDescription(service);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full p-3 text-left hover:bg-[#4a7c59]/5 transition-colors duration-200 text-gray-700 hover:text-[#4a7c59]"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о покупателе и получателе */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4a7c59] transition-colors duration-300" />
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    placeholder="Ваше имя"
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4a7c59] transition-colors duration-300" />
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    required
                    placeholder="Ваш email"
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4a7c59] transition-colors duration-300" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    placeholder="Имя получателя"
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4a7c59] transition-colors duration-300" />
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Дополнительные пожелания */}
            <div className="relative group">
              <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#4a7c59] transition-colors duration-300" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                placeholder="Дополнительные пожелания (опционально)"
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm resize-none"
              />
            </div>

            {/* Кнопка оформления (с оплатой) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Оформление...
                </span>
              ) : (
                'Оформить сертификат и перейти к оплате'
              )}
            </button>
          </div>
        </form>

        {/* Преимущества с анимацией */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, text: 'Именной сертификат' },
            { icon: Calendar, text: 'Срок 1 год' },
            { icon: Mail, text: 'Отправка на email' },
            { icon: Gift, text: 'Идеальный подарок' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 bg-[#faf8f6] rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-md cursor-default flex flex-col items-center justify-center ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <item.icon className="w-6 h-6 text-[#4a7c59] mb-2 flex-shrink-0" />
              <p className="text-gray-500 text-sm text-center leading-tight">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Добавляем CSS анимации */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}