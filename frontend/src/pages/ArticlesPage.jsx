import { Link } from 'react-router-dom';
import { Clock, Gift, BookOpen, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2c2c2c] mb-4">Обучение макияжу</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Научитесь создавать идеальный макияж, который подчеркнёт вашу уникальность
          </p>
        </div>

        {/* Что вы узнаете */}
        <div className="bg-[#faf8f6] rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#4a7c59]" />
            <h2 className="text-2xl font-serif text-[#2c2c2c]">Что вы узнаете на уроке</h2>
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
                <CheckCircle className="w-5 h-5 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100">
            <p className="text-gray-500 text-sm">✨ На одной стороне лица я показываю, на второй вы повторяете сами.</p>
            <p className="text-gray-500 text-sm mt-1">⏱ Длительность урока 2,5–3 часа</p>
            <p className="text-gray-500 text-sm mt-1">🎁 Подарю 2 гайда: по косметике (200+ продуктов) и кистям</p>
          </div>
        </div>

        <h2 className="text-2xl font-serif text-[#2c2c2c] text-center mb-8">Выберите формат обучения</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Один урок */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[#2c2c2c]">Один урок</h3>
                <BookOpen className="w-6 h-6 text-[#4a7c59]" />
              </div>
              <p className="text-gray-500 mb-4">Любой запрос — от дневного до вечернего макияжа</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[#4a7c59]">9000</span>
                <span className="text-gray-400">₽</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm"><Clock className="w-4 h-4 text-[#4a7c59]" /> Длительность 2,5–3 часа</div>
                <div className="flex items-center gap-2 text-gray-500 text-sm"><Gift className="w-4 h-4 text-[#4a7c59]" /> 2 гайда в подарок</div>
              </div>
              <Link to="/booking" className="block w-full text-center btn-primary">Записаться</Link>
            </div>
          </div>

          {/* Два урока */}
          <div className="bg-white rounded-2xl border-2 border-[#4a7c59] shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="bg-[#4a7c59]/10 p-2 text-center"><span className="text-[#4a7c59] text-sm font-semibold">ПОПУЛЯРНЫЙ ВЫБОР</span></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[#2c2c2c]">Два урока</h3>
                <Star className="w-6 h-6 text-[#4a7c59] fill-[#4a7c59]" />
              </div>
              <p className="text-gray-500 mb-4">В первый день — лёгкий/дневной макияж, во второй — вечерний вариант и закрепление</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[#4a7c59]">15000</span>
                <span className="text-gray-400">₽</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm"><Clock className="w-4 h-4 text-[#4a7c59]" /> 2 занятия по 2,5–3 часа</div>
                <div className="flex items-center gap-2 text-gray-500 text-sm"><Gift className="w-4 h-4 text-[#4a7c59]" /> Укладка в подарок + 2 гайда</div>
              </div>
              <Link to="/booking" className="block w-full text-center btn-primary">Записаться</Link>
            </div>
          </div>
        </div>

        {/* Бонусы */}
        <div className="bg-[#faf8f6] rounded-2xl p-6 text-center border border-gray-100 mb-12">
          <h3 className="text-xl font-serif text-[#2c2c2c] mb-2">Подарки для всех участниц</h3>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-gray-600"><Gift className="w-5 h-5 text-[#4a7c59]" /> 2 гайда: 200+ продуктов и кисти</div>
            <div className="flex items-center gap-2 text-gray-600"><Clock className="w-5 h-5 text-[#4a7c59]" /> Гибкий график занятий</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/booking" className="inline-flex items-center gap-2 btn-primary text-lg py-3 px-8">
            Записаться на урок <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-400 text-sm mt-4">Остались вопросы? Напишите в Telegram или Instagram</p>
        </div>
      </div>
    </div>
  );
}