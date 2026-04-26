import { useState } from 'react';
import { Heart, Star, Sparkles, ChevronRight, X, User } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';

export default function AboutSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const aboutImages = [
    { src: '/IMG_20260411_232456_858.jpg', position: 'top-left', className: 'w-32 h-32 md:w-56 md:h-56 rounded-xl md:rounded-2xl rotate-[-8deg] z-0 animate-float-slow' },
    { src: '/IMG_20260411_232456_868-1.jpg', position: 'top-right', className: 'w-28 h-36 md:w-48 md:h-64 rounded-xl md:rounded-2xl rotate-[5deg] z-10 animate-float-medium' },
    { src: '/IMG_20260411_232456_872-1.jpg', position: 'center', className: 'w-32 h-32 md:w-52 md:h-52 rounded-xl md:rounded-2xl border-2 md:border-4 border-white z-20 animate-pulse-slow' },
    { src: '/IMG_20260411_232456_875.jpg', position: 'bottom-left', className: 'w-28 h-28 md:w-48 md:h-48 rounded-xl md:rounded-2xl rotate-[12deg] z-10 animate-float-slower' },
    { src: '/IMG_20260411_232456_880-1.jpg', position: 'bottom-right', className: 'w-32 h-24 md:w-56 md:h-44 rounded-xl md:rounded-2xl rotate-[-10deg] z-10 animate-float-medium-delay' },
  ];

  const getPositionStyle = (position) => {
    switch (position) {
      case 'top-left': return { left: 0, top: 0 };
      case 'top-right': return { right: 0, top: 0 };
      case 'center': return { left: '48%', top: '50%', transform: 'translate(-50%, -50%)' };
      case 'bottom-left': return { left: '8px', bottom: 0 };
      case 'bottom-right': return { right: '8px', bottom: 0 };
      default: return {};
    }
  };

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

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 text-[#4a7c59] font-medium hover:gap-3 transition-all duration-300 group text-sm md:text-base"
            >
              Узнать больше обо мне
              <ChevronRight size={16} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Правая колонка - коллаж с OptimizedImage */}
          <div className="relative flex justify-center items-center min-h-[400px] md:min-h-[520px] order-2 mt-8 md:mt-0">
            {aboutImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute ${img.className} overflow-hidden shadow-lg hover:scale-110 hover:rotate-0 transition-all duration-500 cursor-pointer`}
                style={getPositionStyle(img.position)}
              >
                <OptimizedImage
                  src={img.src}
                  alt={`Фото ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно (без изменений) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-w-[95%] md:max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b]" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-white rounded-full p-1.5 md:p-2 shadow-md text-gray-400 hover:text-[#4a7c59] transition">
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
                <p>Я безумно люблю свою работу и творю красоту уже более 6-ти лет.</p>
                <p>Всегда расту и развиваюсь: каждый год прохожу различные обучения у ТОПовых мастеров России.</p>
                <p>Для каждого клиента у меня индивидуальный подход, я не просто крашу и укладываю, а еще и погружаюсь в ваш образ.</p>
                <p>Работаю в самых уютных и красивых студиях в центре города, чтобы вы получили максимальное наслаждение от процесса!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`... (оставляем без изменений) ...`}</style>
    </section>
  );
}