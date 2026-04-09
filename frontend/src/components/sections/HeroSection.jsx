import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative flex items-center min-h-screen w-full overflow-hidden">
      {/* Фоновое изображение с анимацией появления */}
      <div
        className="absolute inset-0 z-0 animate-image-reveal"
        style={{
          backgroundImage: "url('/IMG_4177.JPG')",
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent pointer-events-none z-5" />
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl ml-4 md:ml-8 mt-4 md:mt-8">

          <div className="mb-4 animate-fade-in-up">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#4a7c59] tracking-tight uppercase">
              ПРОФЕССИОНАЛЬНЫЙ ВИЗАЖИСТ-СТИЛИСТ
            </h2>
          </div>

          {/* Более строгий стиль: увеличенный межбуквенный интервал, нормальный вес, без курсива */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-sans font-normal text-black leading-relaxed tracking-wide mt-4 animate-slide-in-left max-w-3xl">
            Создаю эстетичные выразительные образы, в которых ты остаешься собой
          </h1>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up animation-delay-400">
            <Link
              to="/booking"
              className="bg-[#4a7c59] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:bg-[#2c2c2c] hover:scale-105 group"
            >
              Записаться
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">→</span>
            </Link>
            <Link
              to="/portfolio"
              className="border-2 border-[#4a7c59] text-[#4a7c59] font-bold py-3 px-8 rounded-full transition-all duration-300 hover:bg-[#2c2c2c] hover:border-[#2c2c2c] hover:text-white hover:scale-105"
            >
              Портфолио
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}