import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MAIL_RECIPIENTS = [
  { name: 'Сергей', email: 'georgio1997@mail.ru' },
  { name: 'Анастасия', email: 'romancha.96@list.ru' },
];

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextName = fullName.trim();
    if (!nextName) {
      setFailed(true);
      setMessage('Введите имя');
      return;
    }
    setLoading(true);
    setMessage('');
    setFailed(false);
    try {
      const { data } = await api.patch('/auth/me', { full_name: nextName });
      updateUser(data);
      setFullName(data.full_name || nextName);
      setMessage('Профиль обновлён');
    } catch (err) {
      setFailed(true);
      const detail = err.response?.data?.detail;
      setMessage(typeof detail === 'string' ? detail : 'Не удалось сохранить имя');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Настройки профиля</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Имя</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            />
          </div>
          {message && (
            <p className={`text-sm ${failed ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
          )}
          <button type="submit" disabled={loading} className="bg-[#4a7c59] text-white px-4 py-2 rounded hover:bg-[#2d5a3b]">
            Сохранить
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-lg font-medium text-gray-800 mb-1">Куда приходят письма</h2>
        <p className="text-sm text-gray-500 mb-4">
          Записи, сертификаты, вопросы и утренний отчёт.
        </p>
        <ul className="space-y-3">
          {MAIL_RECIPIENTS.map((recipient) => (
            <li key={recipient.email} className="flex items-center justify-between gap-4 border border-gray-200 rounded-md px-3 py-2">
              <span className="text-sm font-medium text-gray-800">{recipient.name}</span>
              <span className="text-sm text-gray-600">{recipient.email}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}