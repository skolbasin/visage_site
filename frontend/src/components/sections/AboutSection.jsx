import { useState } from 'react';
import { Heart, Star, Sparkles, ChevronRight, X, User } from 'lucide-react';

export default function AboutSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="about" className="py-12 md:py-20 bg-white w-full">
      <div className="px-4 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Левая колонка - текст */}
          <div className="animate-fade-in-right order-1">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-2 inline-block">
                  Обо мне
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
                </span>
              </h2>
            </div>

            <p className="text-gray-600 text-base md:text-xl mb-6 leading-relaxed">
              Меня зовут Настя. Я визажист-стилист из Санкт-Петербурга с опытом более 6 лет.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2c2c2c] text-base md:text-lg">Индивидуальный подход</h4>
                  <p className="text-gray-500 text-sm md:text-base">Учитываю ваши пожелания, особенности внешности и образ мероприятия</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2c2c2c] text-base md:text-lg">Премиум косметика</h4>
                  <p className="text-gray-500 text-sm md:text-base">Работаю только с лучшими брендами для безупречного результата</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#4a7c59] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#2c2c2c] text-base md:text-lg">Постоянное развитие</h4>
                  <p className="text-gray-500 text-sm md:text-base">Ежегодно прохожу обучения у топовых мастеров России</p>
                </div>
              </div>
            </div>

            {/* Кнопка "Узнать больше обо мне" - адаптив */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 text-[#4a7c59] font-medium hover:gap-3 transition-all duration-300 group text-sm md:text-base"
            >
              Узнать больше обо мне
              <ChevronRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Правая колонка - коллаж с фото - адаптив */}
          <div className="relative flex justify-center items-center min-h-[400px] md:min-h-[520px] order-2 mt-8 md:mt-0">
            {/* Фото 1 - верхнее левое */}
            <div className="absolute left-0 top-0 w-32 h-32 md:w-56 md:h-56 rounded-xl md:rounded-2xl overflow-hidden shadow-lg rotate-[-8deg] z-0 animate-float-slow hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_858.jpg" alt="Работа 1" className="w-full h-full object-cover" />
            </div>

            {/* Фото 2 - верхнее правое */}
            <div className="absolute right-0 top-0 w-28 h-36 md:w-48 md:h-64 rounded-xl md:rounded-2xl overflow-hidden shadow-lg rotate-[5deg] z-10 animate-float-medium hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_868-1.jpg" alt="Работа 2" className="w-full h-full object-cover" />
            </div>

            {/* Фото 3 - центральное */}
            <div
              className="absolute w-32 h-32 md:w-52 md:h-52 rounded-xl md:rounded-2xl overflow-hidden shadow-xl border-2 md:border-4 border-white z-20 animate-pulse-slow hover:scale-110 transition-all duration-500 cursor-pointer"
              style={{
                left: '48%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img src="/IMG_20260411_232456_872-1.jpg" alt="Настя" className="w-full h-full object-cover object-[50%_25%]" />
            </div>

            {/* Фото 4 - нижнее левое */}
            <div className="absolute left-2 md:left-8 bottom-0 w-28 h-28 md:w-48 md:h-48 rounded-xl md:rounded-2xl overflow-hidden shadow-md rotate-[12deg] z-10 animate-float-slower hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_875.jpg" alt="Работа 4" className="w-full h-full object-cover" />
            </div>

            {/* Фото 5 - нижнее правое */}
            <div className="absolute right-2 md:right-8 bottom-0 w-32 h-24 md:w-56 md:h-44 rounded-xl md:rounded-2xl overflow-hidden shadow-md rotate-[-10deg] z-10 animate-float-medium-delay hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer">
              <img src="/IMG_20260411_232456_880-1.jpg" alt="Работа 5" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно с полной информацией - адаптив */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-[95%] md:max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b]" />

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-white rounded-full p-1.5 md:p-2 shadow-md text-gray-400 hover:text-[#4a7c59] transition-colors duration-300"
            >
              <X size={16} className="md:w-5 md:h-5" />
            </button>

            <div className="p-5 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#4a7c59]/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-[#4a7c59]" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-[#2c2c2c]">Анастасия Романча</h3>
              </div>

              <div className="space-y-3 md:space-y-4 text-gray-600 text-sm md:text-base">
                <p className="leading-relaxed">
                  Я безумно люблю свою работу и творю красоту уже более 6-ти лет.
                </p>
                <p className="leading-relaxed">
                  Всегда расту и развиваюсь: каждый год прохожу различные обучения у ТОПовых мастеров
                  России по макияжам и прическам, поэтому я всегда знаю, что "в тренде".
                </p>
                <p className="leading-relaxed">
                  За годы работы я отлично развила в себе такое качество, как "насмотренность",
                  поэтому часто слышу от своих клиентов фразу "как красиво ты меня увидела".
                </p>
                <p className="leading-relaxed">
                  Для каждого клиента у меня индивидуальный подход, я не просто крашу и укладываю,
                  а еще и погружаюсь в ваш образ, ориентируясь на ваши пожелания, учитывая вашу
                  внешность, какие детали в образе и на какое мероприятие идете.
                </p>
                <p className="leading-relaxed">
                  Работаю в самых уютных и красивых студиях в центре города, чтобы вы получили
                  максимальное наслаждение от процесса! Отзывы моих клиентов говорят сами за себя,
                  читайте в разделе "отзывы".
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-3 md:gap-4">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Star size={12} className="md:w-4 md:h-4 text-[#4a7c59] fill-[#4a7c59]" />
                    <span className="text-xs md:text-sm text-gray-500">6+ лет опыта</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Star size={12} className="md:w-4 md:h-4 text-[#4a7c59] fill-[#4a7c59]" />
                    <span className="text-xs md:text-sm text-gray-500">Обучения у ТОП-мастеров</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Star size={12} className="md:w-4 md:h-4 text-[#4a7c59] fill-[#4a7c59]" />
                    <span className="text-xs md:text-sm text-gray-500">Индивидуальный подход</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(-8deg); }
          50% { transform: translateY(-8px) rotate(-5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50% { transform: translateY(-6px) rotate(8deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-5px) rotate(15deg); }
        }
        @keyframes float-medium-delay {
          0%, 100% { transform: translateY(0px) rotate(-10deg); }
          50% { transform: translateY(-6px) rotate(-7deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.02); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 7s ease-in-out infinite;
        }
        .animate-float-medium-delay {
          animation: float-medium-delay 5.5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        @media (max-width: 768px) {
          .animate-float-slow {
            animation: float-slow 4s ease-in-out infinite;
          }
          .animate-float-medium {
            animation: float-medium 3.5s ease-in-out infinite;
          }
          .animate-float-slower {
            animation: float-slower 5s ease-in-out infinite;
          }
          .animate-float-medium-delay {
            animation: float-medium-delay 4s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        }
      `}</style>
    </section>
  );
}