import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit } from 'lucide-react';

export default function AdminFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: 'photo', content: '', media_url: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/admin/posts');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/posts/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post('/admin/posts', form);
      }
      setForm({ type: 'photo', content: '', media_url: '' });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить пост?')) {
      await api.delete(`/admin/posts/${id}`);
      fetchPosts();
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setForm({ type: post.type, content: post.content || '', media_url: post.media_url || '' });
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Бьюти-лента</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать пост' : 'Создать пост'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Тип</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="photo">Фото</option>
              <option value="text">Текст</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ссылка на медиа (если фото/видео)</label>
            <input
              type="text"
              value={form.media_url}
              onChange={e => setForm({ ...form, media_url: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="/uploads/photo.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Текст</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Текст поста..."
            />
          </div>
          <button type="submit" className="bg-[#4a7c59] text-white px-4 py-2 rounded hover:bg-[#2d5a3b]">
            {editingId ? 'Обновить' : 'Создать'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ type: 'photo', content: '', media_url: '' }); }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
              Отмена
            </button>
          )}
        </form>
      </div>

      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              {post.content && <p className="mt-1">{post.content}</p>}
              {post.media_url && <img src={post.media_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded" />}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(post)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
              <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}