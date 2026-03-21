import { Link } from 'react-router-dom';

export default function HomePage() {
  const services = [
    {
      name: 'Свадебный макияж',
      price: 'от 5000 ₽',
      desc: 'Стойкий образ на весь день + фотосессия',
      highlight: true
    },
    {
      name: 'Вечерний макияж',
      price: 'от 4000 ₽',
      desc: 'Идеален для мероприятий и фотосессий'
    },
    {
      name: 'Дневной макияж',
      price: 'от 3000 ₽',
      desc: 'Лёгкий и естественный образ'
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Подчеркну твою естественную красоту
            </h1>

            <p className="mt-4 text-gray-300 text-lg">
              Макияж, который выглядит дорого и держится весь день
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

      {/* ABOUT */}
      <section id="about" className="py-24 bg-darkgray">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          <div>
            <h2 className="text-3xl text-gold font-bold mb-6">О себе</h2>
            <p className="text-gray-300 leading-relaxed">
              Я визажист с опытом более 8 лет. Работаю с невестами, моделями и клиентами,
              которым важен безупречный результат.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-72 h-72 rounded-full overflow-hidden border-4 border-gold shadow-2xl">
              <img src="/IMG_4327.JPEG" className="w-full h-full object-cover" />
            </div>
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
                  relative p-8 rounded-2xl border transition duration-300
                  ${s.highlight
                    ? 'border-gold bg-darkgray scale-105 shadow-2xl'
                    : 'border-gray-700 bg-darkgray hover:border-gold hover:-translate-y-2'}
                `}
              >
                {/* бейдж */}
                {s.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black text-sm px-3 py-1 rounded-full font-bold">
                    Популярно
                  </div>
                )}

                <h3 className="text-white text-2xl mb-4">{s.name}</h3>

                <p className="text-gray-400 mb-6">{s.desc}</p>

                <p className="text-gold text-2xl font-bold mb-6">
                  {s.price}
                </p>

                <Link
                  to="/booking"
                  className="block text-center border border-gold text-gold py-2 rounded-lg hover:bg-gold hover:text-black transition"
                >
                  Записаться
                </Link>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-darkgray text-center">
        <h2 className="text-3xl text-gold mb-6">Контакты</h2>

        <p className="text-gray-300 leading-relaxed">
          📍 Москва, Арбат <br />
          📞 +7 (999) 123-45-67 <br />
          ✉️ anna@makeup.ru
        </p>

        <div className="mt-8 flex justify-center gap-6">
          <a href="https://instagram.com" className="text-gold hover:underline">
            Instagram
          </a>
          <a href="https://t.me" className="text-gold hover:underline">
            Telegram
          </a>
        </div>
      </section>
    </>
  );
}