import { useState } from 'react';
import { Gift, Sparkles, Calendar, Mail, User, MessageSquare, Tag, CreditCard } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    } catch (error) {
      setResult({ success: false, error: error.response?.data?.detail || 'Ошибка оформления' });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [1000, 2000, 3000, 5000, 10000];

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-rose-900/10 to-gold-900/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Заголовок с декорацией */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold to-amber-600 rounded-full mb-6 shadow-lg">
            <Gift className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">
            Подарочный сертификат
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Сделайте близкому человеку незабываемый подарок — красоту и стиль
          </p>
        </div>

        {/* Сообщение об успехе */}
        {result && result.success && (
          <div className="mb-8 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Сертификат успешно оформлен!</h3>
                <p className="text-gray-300 mb-3">
                  Код сертификата: <span className="text-gold font-mono text-lg">{certificateCode}</span>
                </p>
                <p className="text-gray-400">
                  Мы отправили его на email <strong>{buyerEmail}</strong>. Сохраните код для активации.
                </p>
                <div className="mt-4 p-3 bg-black/30 rounded-lg border border-gold/30">
                  <p className="text-sm text-gray-400">Подарок для: <span className="text-gold">{recipientName}</span></p>
                  <p className="text-sm text-gray-400 mt-1">Подарил(а): <span className="text-gold">{buyerName}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="mb-8 bg-gradient-to-r from-red-900/50 to-rose-900/50 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-red-300">{result.error}</p>
            </div>
          </div>
        )}

        {/* Форма в стиле подарочного сертификата */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-gradient-to-br from-darkgray to-gray-900 rounded-2xl border border-gold/30 shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gold via-amber-500 to-gold" />

            <div className="p-6 md:p-8 space-y-6">
              {/* Тип сертификата с иконками */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setType('fixed_amount')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    type === 'fixed_amount'
                      ? 'border-gold bg-gold/10 shadow-lg scale-105'
                      : 'border-gray-700 hover:border-gold/50'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 mx-auto mb-2 ${type === 'fixed_amount' ? 'text-gold' : 'text-gray-500'}`} />
                  <p className={`font-medium ${type === 'fixed_amount' ? 'text-gold' : 'text-gray-400'}`}>Фиксированная сумма</p>
                </button>
                <button
                  type="button"
                  onClick={() => setType('specific_service')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    type === 'specific_service'
                      ? 'border-gold bg-gold/10 shadow-lg scale-105'
                      : 'border-gray-700 hover:border-gold/50'
                  }`}
                >
                  <Tag className={`w-8 h-8 mx-auto mb-2 ${type === 'specific_service' ? 'text-gold' : 'text-gray-500'}`} />
                  <p className={`font-medium ${type === 'specific_service' ? 'text-gold' : 'text-gray-400'}`}>Конкретная услуга</p>
                </button>
              </div>

              {/* Быстрый выбор суммы */}
              {type === 'fixed_amount' && (
                <div className="space-y-3">
                  <label className="block text-gray-300 text-sm font-medium">Сумма сертификата</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {quickAmounts.map((sum) => (
                      <button
                        key={sum}
                        type="button"
                        onClick={() => setAmount(sum.toString())}
                        className={`px-4 py-2 rounded-lg border transition ${
                          Number(amount) === sum
                            ? 'border-gold bg-gold text-black'
                            : 'border-gray-700 text-gray-400 hover:border-gold/50'
                        }`}
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
                    className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                  />
                </div>
              )}

              {type === 'specific_service' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Описание услуги</label>
                  <textarea
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    required
                    rows="3"
                    placeholder="Например: Свадебный макияж и прическа, Вечерний образ и т.д."
                    className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition resize-none"
                  />
                </div>
              )}

              {/* Информация о покупателе и получателе */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                      placeholder="Ваше имя"
                      className="w-full pl-10 p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required
                      placeholder="Ваш email"
                      className="w-full pl-10 p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                      placeholder="Имя получателя"
                      className="w-full pl-10 p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full pl-10 p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Поздравление */}
              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-500" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="3"
                  placeholder="Напишите поздравление (опционально)"
                  className="w-full pl-10 p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none transition resize-none"
                />
              </div>

              {/* Кнопка оформления */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-gold to-amber-600 text-black font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Оформление...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Оформить сертификат
                    </>
                  )}
                </span>
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                Сертификат будет отправлен на указанный email. Срок действия — 1 год.
              </p>
            </div>
          </div>
        </form>

        {/* Блок преимуществ */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-darkgray/50 rounded-xl border border-gray-700">
            <Sparkles className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Именной сертификат</p>
          </div>
          <div className="p-4 bg-darkgray/50 rounded-xl border border-gray-700">
            <Calendar className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Срок 1 год</p>
          </div>
          <div className="p-4 bg-darkgray/50 rounded-xl border border-gray-700">
            <Mail className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Отправка на email</p>
          </div>
          <div className="p-4 bg-darkgray/50 rounded-xl border border-gray-700">
            <Gift className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Идеальный подарок</p>
          </div>
        </div>
      </div>
    </div>
  );
}