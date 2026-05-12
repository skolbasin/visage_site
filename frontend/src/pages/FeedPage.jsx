import { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import AnimatedStars from '../components/AnimatedStars';
import api from '../services/api';
import { getStaticUrl } from '../config';

export default function BeautyFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedLocal, setLikedLocal] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/posts/');
      setPosts(data);
      const initialLikes = {};
      data.forEach(p => { initialLikes[p.id] = p.likes_count; });
      setLikedLocal(initialLikes);
    } catch (err) {
      console.error('Ошибка загрузки ленты:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    setLikedLocal(prev => ({ ...prev, [postId]: prev[postId] + 1 }));
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setLikedLocal(prev => ({ ...prev, [postId]: data.likes_count }));
    } catch (err) {
      setLikedLocal(prev => ({ ...prev, [postId]: currentLikes }));
      console.error('Ошибка лайка:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <AnimatedStars />
        <div className="w-12 h-12 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 relative overflow-hidden">
      <AnimatedStars />
      <div className="max-w-[600px] mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Бьюти-лента</h1>
          <p className="text-gray-500 text-lg">Свежие работы, вдохновение и моменты из моей профессиональной жизни</p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  А
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Анастасия Романча</h3>
                  <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {post.type === 'photo' && post.media_url && (
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={getStaticUrl(post.media_url)}
                    alt={post.content || 'Пост'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.type === 'text' && post.content && (
                <div className="p-4 bg-gray-50 whitespace-pre-wrap">
                  <p className="text-gray-700">{post.content}</p>
                </div>
              )}

              <div className="p-3">
                <button
                  onClick={() => handleLike(post.id, likedLocal[post.id])}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition"
                >
                  <Heart
                    size={24}
                    className={likedLocal[post.id] > 0 ? "fill-red-500 text-red-500" : ""}
                  />
                  <span className="text-sm font-medium">{likedLocal[post.id]}</span>
                </button>

                {post.type === 'photo' && post.content && (
                  <p className="mt-2 text-sm text-gray-700">{post.content}</p>
                )}
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400">Пока нет постов. Загляните позже!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}