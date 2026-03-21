import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await api.get('/articles', { params: { published_only: true } });
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gold mb-8">Макияж для себя</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Link to={`/articles/${article.slug}`} key={article.id} className="bg-darkgray rounded-lg overflow-hidden hover:shadow-xl transition">
            {article.image_url && (
              <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-bold text-white">{article.title}</h2>
              <p className="text-gray-400 mt-1">{article.excerpt}</p>
              <p className="text-gray-500 text-sm mt-2">{new Date(article.created_at).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}