import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

const statusLabels = {
  active: 'Активен',
  used: 'Использован',
  expired: 'Просрочен'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  used: 'bg-gray-100 text-gray-800',
  expired: 'bg-red-100 text-red-800'
};

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await api.get('/certificates/admin/all');
      setCertificates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markUsed = async (id) => {
    try {
      await api.post(`/certificates/admin/${id}/use`);
      fetchCertificates();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter ? certificates.filter(c => c.status === filter) : certificates;

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Сертификаты</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-[#4a7c59] text-white' : 'bg-gray-200'}`}>Все</button>
        <button onClick={() => setFilter('active')} className={`px-3 py-1 rounded-full text-sm ${filter === 'active' ? 'bg-[#4a7c59] text-white' : 'bg-gray-200'}`}>Активные</button>
        <button onClick={() => setFilter('used')} className={`px-3 py-1 rounded-full text-sm ${filter === 'used' ? 'bg-[#4a7c59] text-white' : 'bg-gray-200'}`}>Использованные</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Покупатель</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Получатель</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата покупки</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="px-4 py-4 text-sm font-mono">{c.code}</td>
                <td className="px-4 py-4 text-sm">
                  {c.type === 'fixed_amount' ? `${c.amount} ₽` : 'Конкретная услуга'}
                </td>
                <td className="px-4 py-4 text-sm">{c.buyer_name}<br/><span className="text-gray-500">{c.buyer_email}</span></td>
                <td className="px-4 py-4 text-sm">{c.recipient_name}</td>
                <td className="px-4 py-4 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[c.status]}`}>
                    {statusLabels[c.status]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {c.status === 'active' && (
                    <button onClick={() => markUsed(c.id)} className="text-[#4a7c59] hover:underline text-sm">
                      Отметить использованным
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}