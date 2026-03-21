// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Затемняющий градиент слева */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />

        {/* Фото визажиста (справа) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/IMG_4177.JPG"
            alt="Визажист"
            className="w-full h-full object-cover object-right"
          />
        </div>

        {/* Контент слева */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Создаю образы, которые подчеркивают твою уникальность
            </h1>
            <p className="mt-4 text-gray-200 text-lg">
              Профессиональный визажист с опытом 8+ лет. Индивидуальный подход,
              качественная косметика и безупречный результат для любого события.
            </p>
            <div className="mt-8 flex space-x-4">
              <Link
                to="/booking"
                className="bg-gold text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition shadow-lg"
              >
                Записаться
              </Link>
              <Link
                to="/portfolio"
                className="border-2 border-gold text-gold font-bold py-3 px-6 rounded-lg hover:bg-gold hover:text-black transition"
              >
                Мои работы
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Блок "О себе" */}
      <section id="about" className="py-20 bg-darkgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gold mb-4">О себе</h2>
              <p className="text-gray-300 leading-relaxed">
                Меня зовут Анастасия, я профессиональный визажист с дипломом международного образца.
                Работаю в индустрии красоты более 8 лет, постоянно повышаю квалификацию
                и слежу за трендами. Моя философия – подчеркнуть естественную красоту
                каждой девушки, создавая образ, в котором она чувствует себя уверенно.
              </p>
              <p className="mt-4 text-gray-300">
                Специализируюсь на свадебном, вечернем и дневном макияже.
                Использую только профессиональную косметику премиум-брендов.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-gold shadow-xl">
                <img
                  src="/IMG_4327.JPEG"
                  alt="Анастасия, визажист"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Блок "Услуги" */}
      <section id="services" className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gold mb-12">Услуги</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Свадебный макияж', price: 'от 5 000 ₽', desc: 'Образ на весь день, стойкий и нежный' },
              { name: 'Вечерний макияж', price: 'от 4 000 ₽', desc: 'Для особых случаев и торжеств' },
              { name: 'Дневной макияж', price: 'от 3 000 ₽', desc: 'Естественный образ для повседневности' }
            ].map((service, idx) => (
              <div key={idx} className="bg-darkgray p-6 rounded-lg border border-gray-700 hover:border-gold transition">
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gold text-lg font-semibold mb-3">{service.price}</p>
                <p className="text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Блок "Контакты" */}
      <section id="contacts" className="py-20 bg-darkgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gold mb-6">Контакты</h2>
          <p className="text-gray-300 text-lg mb-4">
            📍 Москва, студия на Арбате<br />
            📞 +7 (999) 123-45-67<br />
            ✉️ anna@makeup.ru
          </p>
          <div className="flex justify-center space-x-6 mt-8">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-500">
              Instagram
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-500">
              Telegram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}