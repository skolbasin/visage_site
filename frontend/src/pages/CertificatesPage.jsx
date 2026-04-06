import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Sparkles, Calendar, Mail, User, MessageSquare, Tag, CreditCard, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4">
            <Gift className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Подарочный сертификат</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Сделайте близкому человеку незабываемый подарок — красоту и стиль</p>
        </div>

        {result && result.success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">Сертификат успешно оформлен!</h3>
                <p className="text-gray-600 mb-3">Код сертификата: <span className="text-[#4a7c59] font-mono text-lg">{certificateCode}</span></p>
                <p className="text-gray-500">Мы отправили его на email <strong>{buyerEmail}</strong>.</p>
              </div>
            </div>
          </div>
        )}

        {result && !result.success && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-600">{result.error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setType('fixed_amount')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${type === 'fixed_amount' ? 'border-[#4a7c59] bg-[#4a7c59]/5' : 'border-gray-200 hover:border-[#4a7c59]/50'}`}>
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${type === 'fixed_amount' ? 'text-[#4a7c59]' : 'text-gray-400'}`} />
                <p className={`font-medium ${type === 'fixed_amount' ? 'text-[#4a7c59]' : 'text-gray-500'}`}>Фиксированная сумма</p>
              </button>
              <button type="button" onClick={() => setType('specific_service')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${type === 'specific_service' ? 'border-[#4a7c59] bg-[#4a7c59]/5' : 'border-gray-200 hover:border-[#4a7c59]/50'}`}>
                <Tag className={`w-6 h-6 mx-auto mb-2 ${type === 'specific_service' ? 'text-[#4a7c59]' : 'text-gray-400'}`} />
                <p className={`font-medium ${type === 'specific_service' ? 'text-[#4a7c59]' : 'text-gray-500'}`}>Конкретная услуга</p>
              </button>
            </div>

            {type === 'fixed_amount' && (
              <div className="space-y-3">
                <label className="block text-gray-700 text-sm font-medium">Сумма сертификата</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {quickAmounts.map((sum) => (
                    <button key={sum} type="button" onClick={() => setAmount(sum.toString())}
                      className={`px-4 py-2 rounded-lg border transition ${Number(amount) === sum ? 'bg-[#4a7c59] text-white border-[#4a7c59]' : 'border-gray-200 text-gray-600 hover:border-[#4a7c59]'}`}>
                      {sum} ₽
                    </button>
                  ))}
                </div>
                <input type="number" placeholder="Или введите другую сумму" value={amount} onChange={(e) => setAmount(e.target.value)} required
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
              </div>
            )}

            {type === 'specific_service' && (
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Описание услуги</label>
                <textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} required rows="3"
                  placeholder="Например: Свадебный макияж и прическа, Вечерний образ и т.д."
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none" />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required placeholder="Ваше имя"
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
                </div>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required placeholder="Ваш email"
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required placeholder="Имя получателя"
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
                </div>
                <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
                </div>
              </div>
            </div>

            <div className="relative"><MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="3" placeholder="Напишите поздравление (опционально)"
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-4 text-lg">
              {loading ? 'Оформление...' : 'Оформить сертификат'}
            </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-[#faf8f6] rounded-xl"><Sparkles className="w-6 h-6 text-[#4a7c59] mx-auto mb-2" /><p className="text-gray-500 text-sm">Именной сертификат</p></div>
          <div className="p-4 bg-[#faf8f6] rounded-xl"><Calendar className="w-6 h-6 text-[#4a7c59] mx-auto mb-2" /><p className="text-gray-500 text-sm">Срок 1 год</p></div>
          <div className="p-4 bg-[#faf8f6] rounded-xl"><Mail className="w-6 h-6 text-[#4a7c59] mx-auto mb-2" /><p className="text-gray-500 text-sm">Отправка на email</p></div>
          <div className="p-4 bg-[#faf8f6] rounded-xl"><Gift className="w-6 h-6 text-[#4a7c59] mx-auto mb-2" /><p className="text-gray-500 text-sm">Идеальный подарок</p></div>
        </div>
      </div>
    </div>
  );
}