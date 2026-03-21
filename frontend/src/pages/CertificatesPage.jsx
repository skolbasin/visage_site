import { useState } from 'react';
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
    } catch (error) {
      setResult({ success: false, error: error.response?.data?.detail || 'Ошибка оформления' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gold mb-6">Подарочный сертификат</h1>
      <p className="text-gray-300 mb-6">
        Выберите подарок для близкого человека. Сертификат будет отправлен на указанный email.
      </p>

      {result && result.success && (
        <div className="bg-green-900 text-green-200 p-4 rounded mb-6">
          Сертификат успешно оформлен! Код: <strong>{result.code}</strong><br />
          Мы отправили его на email {buyerEmail}. Спасибо за покупку!
        </div>
      )}
      {result && !result.success && (
        <div className="bg-red-900 text-red-200 p-4 rounded mb-6">
          {result.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-darkgray p-6 rounded-lg">
        <div>
          <label className="block text-gray-300 mb-1">Тип сертификата</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
          >
            <option value="fixed_amount">Фиксированная сумма</option>
            <option value="specific_service">Конкретная услуга</option>
          </select>
        </div>

        {type === 'fixed_amount' ? (
          <div>
            <label className="block text-gray-300 mb-1">Сумма (₽)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
            />
          </div>
        ) : (
          <div>
            <label className="block text-gray-300 mb-1">Описание услуги</label>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              required
              rows="3"
              className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
            />
          </div>
        )}

        <div>
          <label className="block text-gray-300 mb-1">Ваше имя *</label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
            className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Ваш email *</label>
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            required
            className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Имя получателя *</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
            className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Поздравление (опционально)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="3"
            className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Срок действия (опционально)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-black font-bold py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? 'Оформление...' : 'Оформить сертификат'}
        </button>
      </form>
    </div>
  );
}