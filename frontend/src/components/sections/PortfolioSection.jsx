import { useState, useEffect } from 'react';

export default function PortfolioSection({ images, onImageClick }) {
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-index');
            if (index && !visibleCards.includes(index)) {
              setVisibleCards((prev) => [...prev, index]);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll-portfolio');
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="portfolio" className="py-16 md:py-20 bg-white w-full relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#faf8f6] to-transparent pointer-events-none" />
      <div className="px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-br from-white to-[#faf8f6] rounded-2xl px-8 md:px-12 py-8 shadow-md border border-gray-100">
            <div className="text-center mb-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-3 inline-block">
                  Мои работы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
                </span>
              </h2>
            </div>
            <p className="text-gray-500 text-center max-w-2xl mx-auto">Каждая работа — это история, созданная с любовью и вниманием к деталям</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <div
                key={idx}
                data-index={idx}
                className={`group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 animate-on-scroll-portfolio ${
                  visibleCards.includes(String(idx)) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transition: 'all 0.5s ease-out', transitionDelay: `${idx * 100}ms` }}
                onClick={() => onImageClick(img)}
              >
                <div className="relative overflow-hidden">
                  <img src={img} alt={`Работа ${idx + 1}`} className="w-full h-96 object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition duration-500">
                    <span className="bg-white/90 text-[#4a7c59] text-sm px-3 py-1 rounded-full">Смотреть</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}