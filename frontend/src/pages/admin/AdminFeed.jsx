import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import { getStaticUrl } from '../../config';

export default function AdminFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, photo_count: 0, text_count: 0, total_likes: 0, last_post: null });
  const [form, setForm] = useState({ type: 'photo', content: '', media_url: '', image_file: null });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts/admin/posts');
      setPosts(data);

      const photoCount = data.filter(p => p.type === 'photo').length;
      const textCount = data.filter(p => p.type === 'text').length;
      const totalLikes = data.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const lastPost = data.length ? data[0] : null;

      setStats({
        total: data.length,
        photo_count: photoCount,
        text_count: textCount,
        total_likes: totalLikes,
        last_post: lastPost
      });
    } catch (err) {
      console.error('Ошибка загрузки постов:', err);
    } finally {
      setLoading(false);
    }
  };

    const uploadImage = async (file) => {
      console.log('Загружаем файл:', file.name, file.type, file.size);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      // Используем fetch вместо axios
      const response = await fetch(`${baseUrl}/posts/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload успешен:', data);
      return data.url;
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let mediaUrl = form.media_url;

      if (form.image_file) {
        mediaUrl = await uploadImage(form.image_file);
      }

      const payload = {
        type: form.type,
        content: form.content,
        media_url: mediaUrl,
        is_published: true
      };

      if (editingId) {
        await api.put(`/posts/admin/posts/${editingId}`, payload);
        setEditingId(null);
      } else {
        await api.post('/posts/admin/posts', payload);
      }

      setForm({ type: 'photo', content: '', media_url: '', image_file: null });
      fetchPosts();
    } catch (err) {
      console.error('Ошибка сохранения поста:', err);
      alert('Ошибка сохранения поста: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Удалить пост? Это действие нельзя отменить.')) {
      try {
        await api.delete(`/posts/admin/posts/${id}`);
        fetchPosts();
      } catch (err) {
        console.error('Ошибка удаления:', err);
        alert('Ошибка удаления поста');
      }
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setForm({
      type: post.type,
      content: post.content || '',
      media_url: post.media_url || '',
      image_file: null
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ type: 'photo', content: '', media_url: '', image_file: null });
  };

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-2xl font-serif text-gray-800 mb-6">Бьюти-лента</h1>

      {/* Статистика */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">Всего постов</p>
          <p className="text-2xl font-bold text-[#4a7c59]">{stats.total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Фото</p>
          <p className="text-2xl font-bold">{stats.photo_count}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Текстовых</p>
          <p className="text-2xl font-bold">{stats.text_count}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Всего лайков</p>
          <p className="text-2xl font-bold">❤️ {stats.total_likes}</p>
        </div>
      </div>

      {/* Форма создания/редактирования */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Редактировать пост' : 'Создать пост'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип поста</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4a7c59] focus:border-[#4a7c59]"
            >
              <option value="photo">Фото</option>
              <option value="text">Текст</option>
            </select>
          </div>

          {form.type === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>

              {form.media_url && !form.image_file && (
                <div className="mb-2">
                  <img
                    src={getStaticUrl(form.media_url)}
                    alt="preview"
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <p className="text-xs text-gray-400 mt-1">Текущее изображение</p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm({ ...form, image_file: file, media_url: '' });
                  }
                }}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4a7c59] file:text-white hover:file:bg-[#2d5a3b] file:cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текст поста</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] resize-none"
              placeholder={form.type === 'photo' ? 'Опишите эту работу...' : 'Напишите текст поста...'}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading || (form.type === 'photo' && !form.media_url && !form.image_file)}
              className="bg-[#4a7c59] text-white px-4 py-2 rounded hover:bg-[#2d5a3b] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Загрузка...
                </span>
              ) : (editingId ? 'Обновить' : 'Создать')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Список постов */}
      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Нет постов. Создайте первый пост!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-start gap-4 hover:shadow-md transition">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${post.type === 'photo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {post.type === 'photo' ? '📷 Фото' : '📝 Текст'}
                  </span>
                  <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</p>
                </div>

                {post.content && (
                  <p className="mt-1 text-gray-700">{post.content}</p>
                )}

                {post.media_url && post.type === 'photo' && (
                  <img
                    src={getStaticUrl(post.media_url)}
                    alt="post"
                    className="mt-2 h-32 w-32 object-cover rounded border hover:scale-105 transition duration-200 cursor-pointer"
                    onClick={() => window.open(getStaticUrl(post.media_url), '_blank')}
                  />
                )}

                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    ❤️ {post.likes_count || 0} лайков
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">ID: {post.id}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(post)}
                  className="text-blue-600 hover:text-blue-800 transition p-1"
                  title="Редактировать"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-600 hover:text-red-800 transition p-1"
                  title="Удалить"
                >
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