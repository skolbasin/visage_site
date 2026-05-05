import { useState, useEffect } from 'react';
import { Gift, Sparkles, Calendar, Mail, User, MessageSquare, Phone, CheckCircle, ChevronDown, FileText, Smartphone, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnimatedStars from '../components/AnimatedStars';

// Список услуг
const servicesList = [
  'Макияж в студии',
  'Прическа в студии',
  'Полный образ (макияж + прическа) в студии',
  'Макияж с выездом',
  'Прическа с выездом',
  'Полный образ с выездом',
  'Обучение макияжу (1 урок)',
  'Обучение макияжу (2 урока)',
];

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificateType, setCertificateType] = useState('electronic');
  const [serviceDescription, setServiceDescription] = useState('');
  const [buyerName, setBuyerName] = useState(user?.full_name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [certificateCode, setCertificateCode] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    setAnimateCard(true);
  }, []);

  const showCustomModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let type, amount = null, serviceDesc = null;

      if (certificateType === 'electronic') {
        if (serviceDescription) {
          // Сертификат на конкретную услугу
          type = 'specific_service';
          serviceDesc = serviceDescription;
        } else {
          // Сертификат на фиксированную сумму
          type = 'fixed_amount';
          amount = 5000;
        }
      } else {
        // Бумажный сертификат (заявка)
        type = 'paper';
      }

      const payload = {
        type: type,
        amount: amount,
        service_description: serviceDesc,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        recipient_name: recipientName,
        message: message,
      };

      console.log('Отправка запроса:', payload);

      const response = await api.post('/certificates/', payload);

      console.log('Ответ сервера:', response.data);

      if (certificateType === 'electronic') {
        setResult({ success: true, code: response.data.code });
        setCertificateCode(response.data.code);
        showCustomModal(
          'Сертификат успешно оформлен! ✨',
          `Код сертификата: ${response.data.code}\n\nМы отправили его на email ${buyerEmail}.`
        );

        // Очищаем форму для электронного сертификата
        setServiceDescription('');
        setRecipientName('');
        setMessage('');
      } else {
        setResult({ success: true, isPaper: true });
        showCustomModal(
          'Заявка успешно отправлена! 📝',
          'Мы свяжемся с вами в ближайшее время для уточнения деталей.'
        );

        // Очищаем форму для бумажного сертификата
        setServiceDescription('');
        setRecipientName('');
        setMessage('');
        setBuyerPhone('');
      }

    } catch (error) {
      console.error('Ошибка при создании сертификата:', error);
      console.error('Детали ошибки:', error.response?.data);
      showCustomModal(
        'Ошибка',
        error.response?.data?.detail || 'Не удалось оформить сертификат. Попробуйте позже.'
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 relative overflow-hidden">
      <AnimatedStars />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b]" />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#4a7c59] transition-colors duration-300"
            >
              <X size={20} />
            </button>
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8 text-[#4a7c59]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2c2c2c] mb-3">{modalTitle}</h3>
              <p className="text-gray-500 whitespace-pre-line">{modalMessage}</p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full btn-primary py-3 rounded-xl"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 transform ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4 animate-pulse">
            <Gift className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Подарочный сертификат</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Сделайте близкому человеку незабываемый подарок — красоту и стиль</p>
        </div>

        <form onSubmit={handleSubmit} className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-500 delay-100 transform ${animateCard ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="p-6 md:p-8 space-y-6">
            {/* Выбор типа сертификата */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCertificateType('electronic')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  certificateType === 'electronic'
                    ? 'border-[#4a7c59] bg-[#4a7c59]/5 shadow-md'
                    : 'border-gray-200 hover:border-[#4a7c59]/50 hover:bg-gray-50'
                }`}
              >
                <Smartphone className={`w-6 h-6 mx-auto mb-2 transition-all duration-300 ${certificateType === 'electronic' ? 'text-[#4a7c59] scale-110' : 'text-gray-400'}`} />
                <p className={`font-medium ${certificateType === 'electronic' ? 'text-[#4a7c59]' : 'text-gray-500'}`}>Электронный сертификат</p>
                <p className="text-xs text-gray-400 mt-1">Придёт на email</p>
              </button>
              <button
                type="button"
                onClick={() => setCertificateType('paper')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  certificateType === 'paper'
                    ? 'border-[#4a7c59] bg-[#4a7c59]/5 shadow-md'
                    : 'border-gray-200 hover:border-[#4a7c59]/50 hover:bg-gray-50'
                }`}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 transition-all duration-300 ${certificateType === 'paper' ? 'text-[#4a7c59] scale-110' : 'text-gray-400'}`} />
                <p className={`font-medium ${certificateType === 'paper' ? 'text-[#4a7c59]' : 'text-gray-500'}`}>Бумажный сертификат</p>
                <p className="text-xs text-gray-400 mt-1">Свяжемся с вами</p>
              </button>
            </div>

            {/* Выбор услуги (только для электронного) */}
            {certificateType === 'electronic' && (
              <div className="animate-fadeIn">
                <label className="block text-gray-700 text-sm font-medium mb-2">Выберите услугу (или оставьте пустым для сертификата на сумму)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 flex justify-between items-center hover:shadow-sm"
                  >
                    <span className={serviceDescription ? 'text-gray-700' : 'text-gray-400'}>
                      {serviceDescription || 'Выберите услугу или оставьте пустым'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => {
                          setServiceDescription('');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full p-3 text-left hover:bg-[#4a7c59]/5 transition-colors duration-200 text-gray-500 italic"
                      >
                        — Сертификат на сумму 5000 ₽ —
                      </button>
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

            {/* Контактные данные */}
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
                {certificateType === 'electronic' ? (
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
                ) : (
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#4a7c59] transition-colors duration-300" />
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                      placeholder="Ваш номер телефона"
                      className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 outline-none transition-all duration-300 hover:shadow-sm"
                    />
                  </div>
                )}
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
              </div>
            </div>

            {/* Пожелания */}
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

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Оформление...
                </span>
              ) : (
                'Оформить сертификат'
              )}
            </button>
          </div>
        </form>

        {/* Информационные карточки */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, text: 'Именной сертификат' },
            { icon: Calendar, text: 'Срок действия 6 месяцев' },
            { icon: Mail, text: certificateType === 'electronic' ? 'Отправка на email' : 'Доставка по договорённости' },
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-bounce {
          animation: bounce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}