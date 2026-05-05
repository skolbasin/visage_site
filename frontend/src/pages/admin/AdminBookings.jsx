import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusOptions = ['new', 'in_progress', 'completed'];
const statusLabels = {
  new: 'Новое',
  in_progress: 'В работе',
  completed: 'Выполнено'
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = filter ? bookings.filter(b => b.status === filter) : bookings;

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Записи</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-[#4a7c59] text-white' : 'bg-gray-200'}`}>Все</button>
        {statusOptions.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-[#4a7c59] text-white' : 'bg-gray-200'}`}>{statusLabels[s]}</button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Услуга</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата записи</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Промокод</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-xs">{booking.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{booking.service_name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.appointment_date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {booking.promo_code ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{booking.promo_code}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                    {statusLabels[booking.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={booking.status}
                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}