import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-16 md:py-20 bg-white text-center w-full">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] mb-4">Готова записаться?</h2>
          <p className="text-gray-500 mb-8">Давайте создадим ваш идеальный образ вместе</p>
          <Link to="/booking" className="btn-primary inline-block group">
            Записаться сейчас
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}