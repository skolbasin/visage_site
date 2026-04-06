import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/articles" className="inline-flex items-center gap-2 text-[#4a7c59] hover:text-[#2d5a3b] transition mb-6">
          <ArrowLeft size={18} /> Назад к списку
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif text-[#2c2c2c] mb-4">{article.title}</h1>
        <div className="text-gray-400 mb-6">{new Date(article.created_at).toLocaleDateString()}</div>
        {article.image_url && <img src={article.image_url} alt={article.title} className="w-full rounded-2xl mb-8" />}
        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </div>
  );
}