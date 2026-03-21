import { useState, useEffect } from 'react';
import api from '../services/api';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 6;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-8">
        <h1 className="text-3xl font-bold text-gold">Бьюти-лента</h1>
        <button
          className="absolute top-0 right-0 bg-darkgray text-gold border border-gold rounded-full w-8 h-8 flex items-center justify-center hover:bg-gold hover:text-black transition"
          onClick={() => alert('Это бьюти-лента — здесь публикуются свежие работы, советы и вдохновение')}
        >
          i
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-darkgray rounded-lg overflow-hidden">
            {post.type !== 'text' && (
              <img src={getMediaUrl(post)} alt="post" className="w-full h-64 object-cover" />
            )}
            {post.content && (
              <div className="p-4">
                <p className="text-gray-300">{post.content}</p>
                <p className="text-gray-500 text-sm mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="bg-gold text-black px-6 py-2 rounded hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Загрузить ещё'}
          </button>
        </div>
      )}
    </div>
  );
}