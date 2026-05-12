import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filtered = filter ? certificates.filter(c => c.status === filter) : certificates;

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Сертификаты</h1>

      {/* Фильтры */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-sm transition ${!filter ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Все ({certificates.length})
        </button>
        <button onClick={() => setFilter('active')} className={`px-3 py-1.5 rounded-full text-sm transition ${filter === 'active' ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Активные ({certificates.filter(c => c.status === 'active').length})
        </button>
        <button onClick={() => setFilter('used')} className={`px-3 py-1.5 rounded-full text-sm transition ${filter === 'used' ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Использованные ({certificates.filter(c => c.status === 'used').length})
        </button>
      </div>

      {/* Мобильные карточки */}
      <div className="block md:hidden space-y-4">
        {filtered.map(cert => (
          <div key={cert.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400 font-mono">{cert.code}</span>
                  <h3 className="font-semibold text-gray-800 mt-1">{cert.buyer_name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[cert.status]}`}>
                  {statusLabels[cert.status]}
                </span>
              </div>
              <button onClick={() => toggleExpand(cert.id)} className="mt-2 text-gray-400 hover:text-gray-600 w-full flex justify-center">
                {expandedId === cert.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedId === cert.id && (
              <div className="p-4 space-y-3 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Тип</p>
                  <p className="text-sm">{cert.type === 'fixed_amount' ? `${cert.amount} ₽` : 'Конкретная услуга'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Получатель</p>
                  <p className="text-sm">{cert.recipient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Дата покупки</p>
                  <p className="text-sm">{new Date(cert.created_at).toLocaleDateString()}</p>
                </div>
                {cert.status === 'active' && (
                  <button onClick={() => markUsed(cert.id)} className="w-full bg-[#4a7c59] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d5a3b] transition">
                    Отметить использованным
                  </button>
                )}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Покупатель</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Получатель</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(cert => (
              <tr key={cert.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm font-mono">{cert.code}</td>
                <td className="px-4 py-4 text-sm">{cert.type === 'fixed_amount' ? `${cert.amount} ₽` : 'Конкретная услуга'}</td>
                <td className="px-4 py-4 text-sm">{cert.buyer_name}<br/><span className="text-gray-500 text-xs">{cert.buyer_email}</span></td>
                <td className="px-4 py-4 text-sm">{cert.recipient_name}</td>
                <td className="px-4 py-4 text-sm">{new Date(cert.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4"><span className={`px-2 py-1 text-xs rounded-full ${statusColors[cert.status]}`}>{statusLabels[cert.status]}</span></td>
                <td className="px-4 py-4">{cert.status === 'active' && <button onClick={() => markUsed(cert.id)} className="text-[#4a7c59] hover:underline text-sm">Отметить использованным</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Сертификатов не найдено</div>}
    </div>
  );
}