import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const statusOptions = [
  { value: 'new', label: 'Новое' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed', label: 'Выполнено' }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get('/admin/questions');
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/questions/${id}/status`, { status: newStatus });
      setQuestions(prev => prev.map(q => (q.id === id ? { ...q, status: newStatus } : q)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Удалить обращение?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredQuestions = filter ? questions.filter(q => q.status === filter) : questions;

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Обращения</h1>

      {/* Фильтры */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-sm transition ${!filter ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Все ({questions.length})
        </button>
        {statusOptions.map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)} className={`px-3 py-1.5 rounded-full text-sm transition ${filter === opt.value ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {opt.label} ({questions.filter(q => q.status === opt.value).length})
          </button>
        ))}
      </div>

      {/* Мобильные карточки */}
      <div className="block md:hidden space-y-4">
        {filteredQuestions.map(q => (
          <div key={q.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs text-gray-400">ID {q.id}</p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{q.message}</p>
                </div>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(q.status)}`}>
                  {statusOptions.find(o => o.value === q.status)?.label}
                </span>
              </div>
              <button onClick={() => toggleExpand(q.id)} className="mt-2 text-gray-400 hover:text-gray-600 w-full flex justify-center">
                {expandedId === q.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedId === q.id && (
              <div className="p-4 space-y-3 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Контакт</p>
                  <p className="text-sm"><span className="font-medium">{q.contact_type}:</span> {q.contact_value}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Дата</p>
                  <p className="text-sm">{new Date(q.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-[#4a7c59] focus:border-[#4a7c59]">
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={20} /></button>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вопрос</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Контакт</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuestions.map(q => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{q.id}</td>
                <td className="px-4 py-4 text-sm text-gray-900 max-w-xs break-words">{q.message}</td>
                <td className="px-4 py-4 text-sm text-gray-500"><span className="font-medium">{q.contact_type}:</span> {q.contact_value}</td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(q.created_at).toLocaleString()}</td>
                <td className="px-4 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(q.status)}`}>{statusOptions.find(o => o.value === q.status)?.label}</span></td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} className="border rounded px-2 py-1 text-sm mr-2">
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredQuestions.length === 0 && <div className="text-center py-12 text-gray-500">Обращений не найдено</div>}
    </div>
  );
}