import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative flex items-center min-h-screen w-full overflow-hidden">
      {/* Фоновое изображение для мобильных устройств */}
      <div
        className="absolute inset-0 z-0 md:hidden"
        style={{
          backgroundImage: "url('/IMG_4177.JPG')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff',
        }}
      />

      {/* Затемнение для мобильных */}
      <div className="absolute inset-0 bg-white/70 md:hidden pointer-events-none z-5" />

      {/* Изображение для ПК (справа, как было) */}
      <div
        className="hidden md:block absolute inset-0 z-0 animate-image-reveal"
        style={{
          backgroundImage: "url('/IMG_4177.JPG')",
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff',
        }}
      />

      {/* Градиент для ПК */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent pointer-events-none z-5" />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto md:mx-0 md:ml-4 lg:ml-8 mt-8 sm:mt-4 md:mt-8 text-center md:text-left">
          {/* Заголовок */}
          <div className="mb-3 sm:mb-4 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#4a7c59] tracking-tight uppercase leading-tight">
              ПРОФЕССИОНАЛЬНЫЙ<br className="hidden sm:block" /> ВИЗАЖИСТ-СТИЛИСТ
            </h2>
          </div>

          {/* Подзаголовок */}
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-sans font-normal text-black leading-relaxed tracking-wide mt-3 sm:mt-4 animate-slide-in-left max-w-3xl mx-auto md:mx-0">
            Создаю эстетичные выразительные образы, в которых ты остаешься собой
          </h1>

          {/* Кнопки */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start animate-fade-in-up animation-delay-400">
            <Link
              to="/booking"
              className="bg-[#4a7c59] text-white font-bold py-3 px-6 sm:px-8 rounded-full transition-all duration-300 hover:bg-[#2c2c2c] hover:scale-105 group text-center"
            >
              Записаться
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </Link>
            <Link
              to="/portfolio"
              className="border-2 border-[#4a7c59] text-[#4a7c59] font-bold py-3 px-6 sm:px-8 rounded-full transition-all duration-300 hover:bg-[#2c2c2c] hover:border-[#2c2c2c] hover:text-white hover:scale-105 text-center"
            >
              Портфолио
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes imageReveal {
          0% {
            opacity: 0;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-image-reveal {
          animation: imageReveal 1.2s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </section>
  );
}