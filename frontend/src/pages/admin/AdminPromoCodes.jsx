import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit, Save, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', discount_percent: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount_percent: 10 });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const { data } = await api.get('/promo/');
      setPromoCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить промокод?')) return;
    try {
      await api.delete(`/promo/${id}`);
      fetchPromoCodes();
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении');
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setEditForm({ code: promo.code, discount_percent: promo.discount_percent });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/promo/${id}`, editForm);
      setEditingId(null);
      fetchPromoCodes();
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ code: '', discount_percent: 0 });
  };

  const handleCreate = async () => {
    if (!newPromo.discount_percent) {
      alert('Заполните поле скидки');
      return;
    }
    try {
      await api.post('/promo/', newPromo);
      setShowCreateForm(false);
      setNewPromo({ code: '', discount_percent: 10 });
      fetchPromoCodes();
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-serif text-gray-800">Промокоды</h1>
        <button onClick={() => setShowCreateForm(true)} className="bg-[#4a7c59] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3d6b4a] transition">
          <Plus size={18} /> Создать промокод
        </button>
      </div>

      {/* Форма создания */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Создать промокод</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Код (оставьте пустым для автогенерации)</label>
              <input type="text" value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="SUMMER2024" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Скидка (%)</label>
              <input type="number" value={newPromo.discount_percent} onChange={(e) => setNewPromo({ ...newPromo, discount_percent: parseInt(e.target.value) })} placeholder="10" className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="bg-[#4a7c59] text-white px-4 py-2 rounded-lg">Создать</button>
            <button onClick={() => setShowCreateForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Отмена</button>
          </div>
        </div>
      )}

      {/* Мобильные карточки */}
      <div className="block md:hidden space-y-4">
        {promoCodes.map(promo => (
          <div key={promo.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold">{promo.code}</p>
                  <p className="text-[#4a7c59] font-bold mt-1">{promo.discount_percent}%</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${promo.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {promo.is_used ? 'Использован' : 'Активен'}
                </span>
              </div>
              <button onClick={() => toggleExpand(promo.id)} className="mt-2 text-gray-400 hover:text-gray-600 w-full flex justify-center">
                {expandedId === promo.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedId === promo.id && (
              <div className="p-4 space-y-3 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500">ID</p>
                  <p className="text-sm">{promo.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Создан</p>
                  <p className="text-sm">{new Date(promo.created_at).toLocaleDateString()}</p>
                </div>
                {promo.used_at && (
                  <div>
                    <p className="text-xs text-gray-500">Использован</p>
                    <p className="text-sm">{new Date(promo.used_at).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleEdit(promo)} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                    <Edit size={16} className="inline mr-1" /> Редактировать
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition">
                    <Trash2 size={16} className="inline mr-1" /> Удалить
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Скидка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Создан</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Использован</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {promoCodes.map(promo => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{promo.id}</td>
                <td className="px-6 py-4 text-sm font-mono">
                  {editingId === promo.id ? (
                    <input type="text" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} className="border rounded px-2 py-1" />
                  ) : promo.code}
                </td>
                <td className="px-6 py-4 text-sm">
                  {editingId === promo.id ? (
                    <input type="number" value={editForm.discount_percent} onChange={(e) => setEditForm({ ...editForm, discount_percent: parseInt(e.target.value) })} className="border rounded px-2 py-1 w-20" />
                  ) : `${promo.discount_percent}%`}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${promo.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {promo.is_used ? 'Использован' : 'Активен'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(promo.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{promo.used_at ? new Date(promo.used_at).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4 text-sm">
                  {editingId === promo.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(promo.id)} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                      <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(promo)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {promoCodes.length === 0 && <div className="text-center py-12 text-gray-500">Промокодов пока нет</div>}
    </div>
  );
}