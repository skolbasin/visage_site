import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Info } from 'lucide-react';
import api from '../services/api';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 6;

  // Заглушки на случай пустого ответа API
  const mockPosts = [
    {
      id: 1,
      type: 'photo',
      media_url: '/IMG_8514.JPG',
      content: 'Свежий образ для вечернего выхода! 🖤✨',
      created_at: new Date().toISOString(),
      author: { name: 'Анастасия', avatar: '/avatar.jpg' }
    },
    {
      id: 2,
      type: 'text',
      content: 'Совет дня: используйте праймер перед тональным — макияж будет держаться дольше и выглядеть свежее. 💄',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      author: { name: 'Анастасия', avatar: '/avatar.jpg' }
    }
  ];

  const fetchPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { data } = await api.get('/posts', { params: { skip, limit, published_only: true } });
      if (data.length < limit) setHasMore(false);
      setPosts((prev) => [...prev, ...data]);
      setSkip((prev) => prev + limit);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Если API не отвечает, показываем заглушки
      if (posts.length === 0) {
        setPosts(mockPosts);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const getMediaUrl = (post) => {
    if (post.media_url) return post.media_url;
    return 'https://via.placeholder.com/600x400?text=No+image';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} д назад`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Хедер ленты */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Бьюти-лента</h1>
        <button
          className="p-2 rounded-full bg-darkgray text-gold hover:bg-gold hover:text-black transition"
          onClick={() => alert('Это бьюти-лента — здесь публикуются свежие работы, советы и вдохновение')}
        >
          <Info size={20} />
        </button>
      </div>

      {/* Посты */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-darkgray rounded-xl overflow-hidden border border-gray-800 shadow-lg">
            {/* Шапка поста */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author?.avatar || '/default-avatar.png'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border border-gold"
                />
                <div>
                  <h3 className="font-semibold text-white">{post.author?.name || 'Анастасия'}</h3>
                  <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gold">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Контент поста */}
            <div className="px-4 pb-2">
              {post.content && (
                <p className="text-gray-300 whitespace-pre-wrap mb-3">{post.content}</p>
              )}
            </div>

            {/* Медиа */}
            {post.type !== 'text' && post.media_url && (
              <div className="w-full">
                <img
                  src={getMediaUrl(post)}
                  alt="post media"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Действия */}
            <div className="flex items-center justify-between p-4 border-t border-gray-800">
              <div className="flex gap-6">
                <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition">
                  <Heart size={20} />
                  <span className="text-sm">0</span>
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-gold transition">
                  <MessageCircle size={20} />
                  <span className="text-sm">0</span>
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-gold transition">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка загрузки ещё */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="bg-gold text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Загрузить ещё'}
          </button>
        </div>
      )}

      {/* Сообщение, если нет постов */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Пока нет постов. Загляните позже!</p>
        </div>
      )}
    </div>
  );
}