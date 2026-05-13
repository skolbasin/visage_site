import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit, Plus, X, Image as ImageIcon } from 'lucide-react';
import { getStaticUrl } from '../../config';

export default function AdminPortfolio() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    category_id: '',
    is_published: true,
    order: 0
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/portfolio/items?published_only=false');
      setItems(data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/portfolio/categories');
      setCategories(data);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    const response = await fetch(`${baseUrl}/posts/admin/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = form.image_url;

      if (form.image_file) {
        imageUrl = await uploadImage(form.image_file);
      }

      const payload = {
        title: form.title,
        description: form.description,
        image_url: imageUrl,
        category_id: parseInt(form.category_id),
        is_published: form.is_published,
        order: form.order
      };

      if (editingId) {
        await api.put(`/portfolio/items/${editingId}`, payload);
        setEditingId(null);
      } else {
        await api.post('/portfolio/items', payload);
      }

      setForm({ title: '', description: '', image_url: '', category_id: '', is_published: true, order: 0, image_file: null });
      setShowCreateForm(false);
      fetchItems();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка сохранения: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить работу? Это действие нельзя отменить.')) return;
    try {
      await api.delete(`/portfolio/items/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка удаления');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category_id: item.category_id,
      is_published: item.is_published,
      order: item.order,
      image_file: null
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', description: '', image_url: '', category_id: '', is_published: true, order: 0, image_file: null });
    setShowCreateForm(false);
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif text-gray-800">Портфолио</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#4a7c59] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3d6b4a] transition"
        >
          <Plus size={18} />
          Добавить работу
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать работу' : 'Добавить работу'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#4a7c59] focus:border-[#4a7c59]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#4a7c59] focus:border-[#4a7c59]"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
                {form.image_url && !form.image_file && (
                  <div className="mb-2">
                    <img src={getStaticUrl(form.image_url)} alt="preview" className="h-20 w-20 object-cover rounded border" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setForm({ ...form, image_file: file, image_url: '' });
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#4a7c59] file:text-white hover:file:bg-[#2d5a3b] file:cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-[#4a7c59] focus:border-[#4a7c59]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4 text-[#4a7c59]"
                />
                <span className="text-sm text-gray-700">Опубликовано</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="bg-[#4a7c59] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3b] transition disabled:opacity-50"
              >
                {uploading ? 'Загрузка...' : (editingId ? 'Обновить' : 'Создать')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список работ */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Нет работ в портфолио. Добавьте первую работу!</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition">
              <div className="flex-1 flex gap-4">
                {item.image_url && (
                  <img
                    src={getStaticUrl(item.image_url)}
                    alt={item.title}
                    className="h-20 w-20 object-cover rounded border"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    {!item.is_published && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">Не опубликовано</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.category?.name || 'Без категории'}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Порядок: {item.order}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 p-1" title="Редактировать">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1" title="Удалить">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}