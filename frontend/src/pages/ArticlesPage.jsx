import { Link } from 'react-router-dom';
import { Clock, Gift, BookOpen, Sparkles, Calendar, CheckCircle, Star, ArrowRight } from 'lucide-react';

export default function ArticlesPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">
        {/* Hero секция */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">
            Макияж для себя
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Научитесь создавать идеальный макияж, который подчеркнёт вашу уникальность
          </p>
        </div>

        {/* Что вы узнаете */}
        <div className="bg-darkgray rounded-2xl p-8 mb-12 border border-gold/20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-gold" />
            <h2 className="text-2xl font-bold text-white">Что вы узнаете на уроке</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Идеальный тон и скрытие несовершенств',
              'Коррекция лица (кремовая/сухая) под ваш тип',
              'Макияж глаз: стрелки, дневной, смоки по вашему желанию',
              'Оформление бровей и губ',
              'Рекомендации по уходу, кистям и подбору косметики'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-black/30 rounded-lg">
            <p className="text-gray-400 text-sm">
              ✨ На одной стороне лица я показываю, на второй вы повторяете сами.
            </p>
          </div>
        </div>

        {/* Варианты уроков */}
        <h2 className="text-2xl font-bold text-gold text-center mb-8">Выберите формат обучения</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Один урок */}
          <div className="bg-darkgray rounded-2xl overflow-hidden border border-gray-700 hover:border-gold transition-all duration-300 hover:-translate-y-2">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">Один урок</h3>
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <p className="text-gray-400 mb-4">Любой запрос — от дневного до вечернего макияжа</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gold">9000</span>
                <span className="text-gray-400">₽</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-gray-300 text-sm">Длительность 2,5–3 часа</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-gold" />
                  <span className="text-gray-300 text-sm">2 гайда в подарок: косметика (200+ продуктов) и кисти</span>
                </div>
              </div>
              <Link
                to="/booking"
                className="block w-full text-center bg-gold text-black font-bold py-2 rounded-lg hover:bg-yellow-500 transition"
              >
                Записаться
              </Link>
            </div>
          </div>

          {/* Два урока */}
          <div className="bg-darkgray rounded-2xl overflow-hidden border-2 border-gold shadow-lg transform hover:-translate-y-2 transition-all duration-300">
            <div className="bg-gold/10 p-2 text-center">
              <span className="text-gold text-sm font-semibold">ПОПУЛЯРНЫЙ ВЫБОР</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white">Два урока</h3>
                <Star className="w-6 h-6 text-gold fill-gold" />
              </div>
              <p className="text-gray-400 mb-4">
                В первый день — лёгкий/дневной макияж, во второй — вечерний вариант и закрепление
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gold">15000</span>
                <span className="text-gray-400">₽</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-gray-300 text-sm">2 занятия по 2,5–3 часа</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-gold" />
                  <span className="text-gray-300 text-sm">В конце — укладка в подарок + 2 гайда</span>
                </div>
              </div>
              <Link
                to="/booking"
                className="block w-full text-center bg-gold text-black font-bold py-2 rounded-lg hover:bg-yellow-500 transition"
              >
                Записаться
              </Link>
            </div>
          </div>
        </div>

        {/* Бонусы */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-2xl p-6 text-center border border-gold/20">
          <h3 className="text-xl font-bold text-white mb-2">Подарки для всех участниц</h3>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" />
              <span className="text-gray-300">2 гайда: 200+ продуктов и кисти</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              <span className="text-gray-300">Гибкий график занятий</span>
            </div>
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="mt-12 text-center">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 bg-gold text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition text-lg"
          >
            Записаться на урок <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-500 text-sm mt-4">Остались вопросы? Напишите в Telegram или Instagram</p>
        </div>
      </div>
    </div>
  );
}