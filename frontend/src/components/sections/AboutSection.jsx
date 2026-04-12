import { Heart, Star, Sparkles } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-20 bg-white w-full">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="animate-fade-in-right">
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-2 inline-block">
                  Обо мне
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
                </span>
              </h2>
            </div>

            <p className="text-gray-600 text-lg md:text-xl mb-6 leading-relaxed">
              Меня зовут Настя. Я визажист-стилист из Санкт-Петербурга с опытом более 6 лет.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <Heart className="w-6 h-6 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2c2c2c] text-lg">Индивидуальный подход</h4>
                  <p className="text-gray-500 text-base">Учитываю ваши пожелания, особенности внешности и образ мероприятия</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <Star className="w-6 h-6 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2c2c2c] text-lg">Премиум косметика</h4>
                  <p className="text-gray-500 text-base">Работаю только с лучшими брендами для безупречного результата</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2c2c2c] text-lg">Постоянное развитие</h4>
                  <p className="text-gray-500 text-base">Ежегодно прохожу обучения у топовых мастеров России</p>
                </div>
              </div>
            </div>
          </div>

          {/* Коллаж с квадратными/прямоугольными картинками */}
          <div className="relative flex justify-center items-center min-h-[520px]">
            {/* Фото 1 - верхнее левое */}
            <div className="absolute left-0 top-0 w-56 h-56 rounded-2xl overflow-hidden shadow-lg rotate-[-8deg] z-0 animate-float-slow hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_858.jpg" alt="Работа 1" className="w-full h-full object-cover" />
            </div>

            {/* Фото 2 - верхнее правое */}
            <div className="absolute right-0 top-0 w-48 h-64 rounded-2xl overflow-hidden shadow-lg rotate-[5deg] z-10 animate-float-medium hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_868-1.jpg" alt="Работа 2" className="w-full h-full object-cover" />
            </div>

            {/* Фото 3 - центральное (поднято выше: top: 35% вместо 42%) */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-52 h-52 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 animate-pulse-slow hover:scale-110 transition-all duration-500 cursor-pointer"
              style={{
                left: '38%',
                top: '35%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img src="/IMG_20260411_232456_872-1.jpg" alt="Настя" className="w-full h-full object-cover object-[50%_25%]" />
            </div>

            {/* Фото 4 - нижнее левое */}
            <div className="absolute left-8 bottom-0 w-48 h-48 rounded-2xl overflow-hidden shadow-md rotate-[12deg] z-15 animate-float-slower hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_875.jpg" alt="Работа 4" className="w-full h-full object-cover" />
            </div>

            {/* Фото 5 - нижнее правое */}
            <div className="absolute right-8 bottom-0 w-56 h-44 rounded-2xl overflow-hidden shadow-md rotate-[-10deg] z-15 animate-float-medium-delay hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_880-1.jpg" alt="Работа 5" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}