import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Info } from 'lucide-react';
import api from '../services/api';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 6;

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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-[#2c2c2c]">Бьюти-лента</h1>
          <button
            className="p-2 rounded-full bg-[#faf8f6] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition"
            onClick={() => alert('Это бьюти-лента — здесь публикуются свежие работы, советы и вдохновение')}
          >
            <Info size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-[#4a7c59] font-semibold">
                    {post.author?.name?.charAt(0) || 'А'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2c2c2c]">{post.author?.name || 'Анастасия'}</h3>
                    <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-[#4a7c59]">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {post.content && (
                <div className="px-4 pb-2">
                  <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                </div>
              )}

              {post.type !== 'text' && post.media_url && (
                <div className="w-full">
                  <img src={post.media_url} alt="post media" className="w-full max-h-96 object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <div className="flex gap-6">
                  <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition">
                    <Heart size={20} />
                    <span className="text-sm">0</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-[#4a7c59] transition">
                    <MessageCircle size={20} />
                    <span className="text-sm">0</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-[#4a7c59] transition">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Загрузка...' : 'Загрузить ещё'}
            </button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>Пока нет постов. Загляните позже!</p>
          </div>
        )}
      </div>
    </div>
  );
}