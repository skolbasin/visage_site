import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedStars from '../components/AnimatedStars';

const feedPosts = [
  {
    id: 1,
    image: '/IMG_8514.JPG',
    title: 'Свадебный макияж "Bridal Glow"',
    description: 'Сияющий свадебный образ с эффектом влажной кожи. Невеста была в восторге! 💍✨',
    likes: 234,
    comments: 12,
    date: '2 дня назад',
  },
  {
    id: 2,
    image: '/IMG_7913.PNG',
    title: 'Классический смоки-айс',
    description: 'Вечерний образ с выразительным дымчатым макияжем глаз. Идеален для особого случая.',
    likes: 189,
    comments: 8,
    date: '5 дней назад',
  },
  {
    id: 3,
    image: '/IMG_9246.JPG',
    title: 'Natural Glow',
    description: 'Естественное сияние и здоровый вид кожи. Макияж без эффекта маски.',
    likes: 156,
    comments: 5,
    date: '1 неделя назад',
  },
  {
    id: 4,
    image: '/IMG_20260412_000019_273.jpg',
    title: 'Нюдовый макияж для фотосессии',
    description: 'Нежный образ с акцентом на скульптурирование лица. Фотогенично и элегантно.',
    likes: 278,
    comments: 15,
    date: '1 неделя назад',
  },
  {
    id: 5,
    image: '/IMG_20260412_000019_281.jpg',
    title: 'Графические стрелки',
    description: 'Чёткие графические стрелки — тренд сезона. Современный и дерзкий образ.',
    likes: 312,
    comments: 23,
    date: '2 недели назад',
  },
  {
    id: 6,
    image: '/IMG_20260412_000029_877.jpg',
    title: 'Instagram-perfect макияж',
    description: 'Трендовый макияж, который собирает лайки в соцсетях. Попробуйте и вы!',
    likes: 445,
    comments: 31,
    date: '2 недели назад',
  },
];

export default function BeautyFeedPage() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [localLikes, setLocalLikes] = useState({});

  const toggleLike = (id, currentLikes) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(prev => prev.filter(item => item !== id));
      setLocalLikes(prev => ({ ...prev, [id]: currentLikes - 1 }));
    } else {
      setLikedPosts(prev => [...prev, id]);
      setLocalLikes(prev => ({ ...prev, [id]: currentLikes + 1 }));
    }
  };

  const getLikeCount = (post) => {
    if (localLikes[post.id] !== undefined) {
      return localLikes[post.id];
    }
    return post.likes;
  };

  return (
    <div className="min-h-screen bg-white py-12 relative overflow-hidden">
      <AnimatedStars />

      <div className="max-w-[600px] mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Бьюти-лента</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Свежие работы, вдохновение и моменты из моей профессиональной жизни
          </p>
        </div>

        <div className="space-y-8">
          {feedPosts.map((post, idx) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Шапка поста */}
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  А
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#2c2c2c]">Анастасия Романча</h3>
                  <p className="text-xs text-gray-400">{post.date}</p>
                </div>
              </div>

              {/* Изображение - квадратное, как в Instagram */}
              <div className="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Действия - только лайк и комментарий */}
              <div className="p-3">
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={() => toggleLike(post.id, getLikeCount(post))}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition"
                  >
                    <Heart
                      size={24}
                      className={likedPosts.includes(post.id) ? 'fill-red-500 text-red-500' : ''}
                    />
                    <span className="text-sm">{getLikeCount(post)}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-[#4a7c59] transition">
                    <MessageCircle size={24} />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                </div>

                {/* Подпись */}
                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-semibold text-[#2c2c2c] mr-2">Анастасия Романча</span>
                    <span className="text-gray-700">{post.description}</span>
                  </p>
                </div>

                {/* Ссылка на запись */}
                <Link
                  to="/booking"
                  className="inline-block mt-3 text-xs text-gray-400 hover:text-[#4a7c59] transition"
                >
                  Записаться на такой же образ →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-[#4a7c59] hover:text-[#2d5a3b] transition"
          >
            Смотреть все работы в портфолио →
          </Link>
        </div>
      </div>
    </div>
  );
}