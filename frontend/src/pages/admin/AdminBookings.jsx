import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const statusOptions = [
  { value: 'new', label: 'Новое' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed', label: 'Выполнено' },
  { value: 'cancelled', label: 'Отменено' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      setBookings(data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
      alert('Не удалось обновить статус');
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Удалить запись? Это действие нельзя отменить.')) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить запись');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredBookings = filter ? bookings.filter(b => b.status === filter) : bookings;

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Записи</h1>

      {/* Фильтры */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm transition ${!filter ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Все ({bookings.length})
        </button>
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${filter === opt.value ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {opt.label} ({bookings.filter(b => b.status === opt.value).length})
          </button>
        ))}
      </div>

      {/* Мобильные карточки */}
      <div className="block md:hidden space-y-4">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400">ID {booking.id}</span>
                  <h3 className="font-semibold text-gray-800 mt-1">{booking.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                  {statusOptions.find(o => o.value === booking.status)?.label}
                </span>
              </div>
              <button
                onClick={() => toggleExpand(booking.id)}
                className="mt-2 text-gray-400 hover:text-gray-600 transition w-full flex justify-center"
              >
                {expandedId === booking.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedId === booking.id && (
              <div className="p-4 space-y-3 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Телефон</p>
                  <p className="text-sm">{booking.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm break-words">{booking.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Услуга</p>
                  <p className="text-sm">{booking.service_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Дата записи</p>
                  <p className="text-sm">{new Date(booking.appointment_date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Промокод</p>
                  <p className="text-sm font-mono">{booking.promo_code || '—'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <select
                    value={booking.status}
                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-[#4a7c59] focus:border-[#4a7c59]"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Десктопная таблица */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Услуга</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Промокод</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{booking.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-xs">{booking.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{booking.service_name || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(booking.appointment_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-mono">
                  {booking.promo_code ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{booking.promo_code}</span>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                    {statusOptions.find(o => o.value === booking.status)?.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm focus:ring-[#4a7c59] focus:border-[#4a7c59]"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button onClick={() => deleteBooking(booking.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">Записей не найдено</div>
      )}
    </div>
  );
}