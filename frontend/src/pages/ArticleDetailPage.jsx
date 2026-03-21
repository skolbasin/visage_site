import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await api.get(`/articles/${slug}`);
        setArticle(data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Статья не найдена' : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Загрузка...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/articles" className="text-gold hover:underline mb-4 inline-block">&larr; Назад к списку</Link>
      <h1 className="text-3xl font-bold text-gold mb-4">{article.title}</h1>
      <div className="text-gray-400 mb-6">{new Date(article.created_at).toLocaleDateString()}</div>
      {article.image_url && (
        <img src={article.image_url} alt={article.title} className="w-full rounded-lg mb-6" />
      )}
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}