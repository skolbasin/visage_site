import { Link } from 'react-router-dom';
import { BookOpen, Clock, Gift, Star, CheckCircle, ArrowRight, Users, Award, Calendar } from 'lucide-react';
import AnimatedStars from '../components/AnimatedStars';

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-white py-12 relative overflow-hidden">
      <AnimatedStars />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a7c59]/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-[#4a7c59]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Макияж для себя</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Научитесь делать красивый и быстрый макияж, который подойдет именно вам!
          </p>
        </div>

        <div className="bg-[#faf8f6] rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-[#4a7c59]" />
            <h2 className="text-2xl font-serif text-[#2c2c2c]">Вы узнаете про:</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Идеальный тон и скрытие несовершенств',
              'Коррекцию (кремовая/сухая) под ваш тип лица',
              'Макияж глаз: стрелки, дневной, смоки по вашему желанию',
              'Оформление бровей и губ',
              'Рекомендации по уходу, кистям и подбору косметики',
              'Секреты профессионального нанесения теней',
              'Техники контурирования и скульптурирования',
              'Работу с разными текстурами косметики',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100">
            <p className="text-gray-500 text-sm">✨ На одной стороне лица я показываю, на второй вы повторяете сами.</p>
            <p className="text-gray-500 text-sm mt-1">⏱ Длительность урока 2,5–3 часа</p>
            <p className="text-gray-500 text-sm mt-1">🎁 Подарю 2 гайда: по косметике (200+ продуктов) и кистям</p>
            <p className="text-gray-500 text-sm mt-1">🎁 Укладка в подарок</p>
          </div>
        </div>

        <h2 className="text-2xl font-serif text-[#2c2c2c] text-center mb-8">Выберите формат обучения</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Один урок */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#2c2c2c]">Один урок</h3>
                <BookOpen className="w-6 h-6 text-[#4a7c59]" />
              </div>
              <p className="text-gray-500 mb-4">Любой запрос — от дневного до вечернего макияжа</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[#4a7c59]">9000</span>
                <span className="text-gray-400">₽</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4 text-[#4a7c59]" /> Длительность 2,5–3 часа
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Gift className="w-4 h-4 text-[#4a7c59]" /> 2 гайда в подарок
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Gift className="w-4 h-4 text-[#4a7c59]" /> Укладка в подарок
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Link to="/booking" className="block w-full text-center bg-[#4a7c59] text-white font-semibold py-3 rounded-full hover:bg-[#2d5a3b] transition group-hover:scale-105">
                Записаться
              </Link>
            </div>
          </div>

          {/* Два урока */}
          <div className="bg-white rounded-2xl border-2 border-[#4a7c59] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
            <div className="bg-[#4a7c59]/10 p-2 text-center">
              <span className="text-[#4a7c59] text-sm font-semibold">ПОПУЛЯРНЫЙ ВЫБОР</span>
            </div>
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[#2c2c2c]">Два урока</h3>
                <Star className="w-6 h-6 text-[#4a7c59] fill-[#4a7c59]" />
              </div>
              <p className="text-gray-500 mb-4">В первый день — лёгкий/дневной макияж, во второй — вечерний вариант и закрепление материала</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[#4a7c59]">15000</span>
                <span className="text-gray-400">₽</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4 text-[#4a7c59]" /> 2 занятия по 2,5–3 часа
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Gift className="w-4 h-4 text-[#4a7c59]" /> 2 гайда в подарок
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Gift className="w-4 h-4 text-[#4a7c59]" /> Укладка в подарок
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Link to="/booking" className="block w-full text-center bg-[#4a7c59] text-white font-semibold py-3 rounded-full hover:bg-[#2d5a3b] transition group-hover:scale-105">
                Записаться
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}