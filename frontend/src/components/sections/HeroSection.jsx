import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

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
        <div className="max-w-lg ml-0 mt-4 md:mt-8">
          <div className="inline-flex items-center gap-2 bg-[#4a7c59]/10 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-[#4a7c59] animate-pulse-slow" />
            <span className="text-sm text-[#4a7c59] font-medium">Профессиональный визажист</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2c2c2c] leading-tight font-serif animate-slide-in-left">
            Создаю эстетичные выразительные образы, в которых ты остаешься собой
          </h1>

          <p className="mt-6 text-gray-600 text-base md:text-lg animate-fade-in-up animation-delay-200">
            Образы для клиентов, сборы невест, обучение макияжу
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up animation-delay-400">
            <Link to="/booking" className="btn-primary group hover:scale-105 transition-transform duration-300">
              Записаться
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link to="/portfolio" className="btn-secondary hover:scale-105 transition-transform duration-300">Портфолио</Link>
          </div>
        </div>
      </div>
    </section>
  );
}