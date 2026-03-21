import { Link } from 'react-router-dom';

export default function HomePage() {
  const services = [
    {
      name: 'Свадебный макияж',
      price: 'от 5000 ₽',
      desc: 'Стойкий образ на весь день',
      highlight: true
    },
    {
      name: 'Вечерний макияж',
      price: 'от 4000 ₽',
      desc: 'Идеален для мероприятий'
    },
    {
      name: 'Дневной макияж',
      price: 'от 3000 ₽',
      desc: 'Лёгкий и естественный'
    }
  ];

  return (
    <>
      {/* HERO */}
      <section
        className="relative flex items-center bg-cover bg-right"
        style={{
          height: '100vh',
          backgroundImage: "url('/IMG_4177.JPG')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Профессиональный макияж, который держится весь день
            </h1>

            <p className="mt-4 text-gray-300 text-lg">
              Свадебный, вечерний и повседневный макияж
            </p>

            {/* доверие */}
            <p className="mt-3 text-gray-400 text-sm">
              8+ лет опыта • 200+ клиентов • премиум косметика
            </p>

            <div className="mt-8 flex gap-4">
              <Link to="/booking" className="btn-primary">
                Записаться
              </Link>

              <Link to="/portfolio" className="btn-secondary">
                Портфолио
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 bg-dark text-center">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6">
          <div>
            <p className="text-3xl text-gold font-bold">8+</p>
            <p className="text-gray-400">лет опыта</p>
          </div>
          <div>
            <p className="text-3xl text-gold font-bold">200+</p>
            <p className="text-gray-400">клиентов</p>
          </div>
          <div>
            <p className="text-3xl text-gold font-bold">100%</p>
            <p className="text-gray-400">довольных</p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24 bg-darkgray">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl text-gold text-center mb-12">
            Мои работы
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {['/IMG_4177.JPG','/IMG_4327.JPEG','/IMG_4177.JPG'].map((img, i) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <img
                  src={img}
                  className="w-full h-80 object-cover hover:scale-110 transition duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-3xl text-gold text-center mb-16">
            Услуги
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div
                key={i}
                className={`
                  p-8 rounded-2xl border transition
                  ${s.highlight
                    ? 'border-gold bg-darkgray scale-105 shadow-xl'
                    : 'border-gray-700 bg-darkgray hover:border-gold hover:-translate-y-2'}
                `}
              >
                <h3 className="text-white text-xl mb-3">{s.name}</h3>

                <p className="text-gray-400 mb-4">{s.desc}</p>

                <ul className="text-gray-400 text-sm mb-6 space-y-1">
                  <li>• Подбор образа</li>
                  <li>• Премиум косметика</li>
                  <li>• Стойкость весь день</li>
                </ul>

                <p className="text-gold text-xl font-bold mb-6">
                  {s.price}
                </p>

                <Link to="/booking" className="btn-secondary block text-center">
                  Записаться
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-darkgray">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-3xl text-gold mb-6">Обо мне</h2>

            <p className="text-gray-300 mb-4">
              Я визажист с опытом более 8 лет. Работаю с невестами, моделями и клиентами,
              которым важен дорогой результат.
            </p>

            <ul className="text-gray-400 space-y-2">
              <li>• 8+ лет опыта</li>
              <li>• 200+ клиентов</li>
              <li>• Премиум косметика</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <img src="/IMG_4327.JPEG" className="w-72 h-72 object-cover rounded-full border-4 border-gold" />
          </div>

        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-dark text-center">
        <h2 className="text-3xl text-gold mb-12">Отзывы</h2>

        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <p className="text-gray-300 italic">
              "Лучший макияж в моей жизни!"
            </p>
            <p className="text-gray-500 mt-2">— Анна</p>
          </div>

          <div>
            <p className="text-gray-300 italic">
              "Очень стойко и красиво, рекомендую!"
            </p>
            <p className="text-gray-500 mt-2">— Мария</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-darkgray text-center">
        <h2 className="text-3xl text-gold mb-6">
          Готова записаться?
        </h2>

        <Link to="/booking" className="btn-primary">
          Записаться сейчас
        </Link>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-dark text-center">
        <h2 className="text-3xl text-gold mb-6">Контакты</h2>

        <p className="text-gray-300">
          📍 Москва <br />
          📞 +7 (999) 123-45-67 <br />
          ✉️ anna@makeup.ru
        </p>

        <div className="mt-6 flex justify-center gap-6">
          <a href="https://instagram.com" className="text-gold">Instagram</a>
          <a href="https://t.me" className="text-gold">Telegram</a>
        </div>
      </section>
    </>
  );
}