export default function MapSection() {
  // Координаты: Санкт-Петербург, ул. Достоевского, 9
  // Яндекс.Карты (работает в РФ)
  const yandexMapUrl = "https://yandex.ru/maps/?text=%D1%83%D0%BB.%20%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE%209%20%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3&mode=search&ll=30.3613,59.9283&z=17";

  // OpenStreetMap (альтернатива, работает везде)
  const osmMapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=30.3553,59.9243,30.3673,59.9323&layer=mapnik&marker=59.9283,30.3613";

  return (
    <section className="py-16 md:py-20 bg-white w-full">
      <div className="px-6 md:px-12 lg:px-20">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
            <span className="relative pb-3 inline-block">
              Я работаю здесь
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full" />
            </span>
          </h2>
          <p className="text-gray-500 text-center mt-4">
            Санкт-Петербург, ул. Достоевского, 9
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Карта с меткой */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <iframe
              src={osmMapUrl}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Карта студии"
              className="w-full"
            />

            {/* Плавающая метка "Я работаю здесь" (CSS-псевдоэлемент поверх карты) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="relative">
                {/* Иконка метки */}
                <div className="w-10 h-10 bg-[#4a7c59] rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                {/* Линия-указатель */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-px h-8 bg-[#4a7c59]"></div>
                {/* Текст под меткой */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-[#4a7c59] font-medium shadow-md">
                  Я работаю здесь
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка "Проложить маршрут" */}
          <div className="text-center mt-6">
            <a
              href={yandexMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#4a7c59] hover:text-[#2d5a3b] transition border border-[#4a7c59] px-5 py-2 rounded-full hover:bg-[#4a7c59] hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Проложить маршрут в Яндекс.Картах
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}