import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Массив с путями к фото портфолио
  const portfolioImages = [
    '/IMG_8514.JPG',
    '/IMG_5405.JPG',
    '/IMG_6428.PNG',
    '/IMG_7913.PNG',
    '/IMG_2578.JPG',
    '/IMG_9246.JPG',
  ];

  const visibleCount = 3;
  const totalImages = portfolioImages.length;
  const maxIndex = totalImages - visibleCount;

  // Переключение слайдов
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1));
  };

  // Открыть модальное окно с фото
  const openModal = (img) => {
    setSelectedImage(img);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Закрыть модальное окно
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  // Обработчик клика на фон
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const services = [
    {
      name: 'Макияж/прическа в студии',
      price: 'от 5000 ₽',
      desc: 'Стойкий образ на весь день',
      highlight: false,
    },
    {
      name: 'Полный образ (макияж и прическа) в студии',
      price: 'от 8000 ₽',
      desc: 'Идеален для мероприятий',
      highlight: false,
    },
    {
      name: 'Макияж/прическа с выездом',
      price: 'от 7000 ₽',
      desc: 'Лёгкий и естественный',
      highlight: false,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section
        className="relative flex items-center"
        style={{
          height: '100vh',
          backgroundImage: "url('/IMG_4177.JPG')",
          backgroundSize: 'cover',
          backgroundPosition: 'right calc(50% + 150px)',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl ml-12 md:ml-24 mt-28 md:mt-40">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Создаю эстетичные выразительные образы, в которых ты остаешься собой
            </h1>

            <p className="mt-4 text-gray-300 text-lg">
              Образы для клиентов, сборы невест, обучение макияжу
            </p>

            <p className="mt-3 text-gray-400 text-sm">
              6+ лет опыта • 700+ клиентов • премиум косметика
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
            <p className="text-3xl text-gold font-bold">6+</p>
            <p className="text-gray-400">лет опыта</p>
          </div>
          <div>
            <p className="text-3xl text-gold font-bold">700+</p>
            <p className="text-gray-400">клиентов</p>
          </div>
          <div>
            <p className="text-3xl text-gold font-bold">100%</p>
            <p className="text-gray-400">довольных</p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO — карусель с тремя видимыми фото */}
      <section id="portfolio" className="py-24 bg-darkgray">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl text-gold text-center mb-12">
            Мои работы
          </h2>

          <div className="relative group">
            {/* Стрелка влево */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-gold hover:text-black transition opacity-0 group-hover:opacity-100 disabled:opacity-30"
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={32} />
            </button>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
              >
                {portfolioImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-1/3 flex-shrink-0 px-3 cursor-pointer"
                    onClick={() => openModal(img)}
                  >
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={img}
                        alt={`Работа ${idx + 1}`}
                        className="w-full h-80 object-cover transition duration-500 hover:scale-110"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Стрелка вправо */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-gold hover:text-black transition opacity-0 group-hover:opacity-100 disabled:opacity-30"
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </section>

      {/* Модальное окно с плавным появлением */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={handleBackdropClick}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-gold hover:text-black transition z-10"
            >
              <X size={24} />
            </button>
            <img
              src={selectedImage}
              alt="Увеличенное фото"
              className="max-w-full max-h-[90vh] object-contain transition-transform duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* SERVICES */}
      <section id="services" className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl text-gold text-center mb-16">Услуги</h2>

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
                <p className="text-gold text-xl font-bold mb-6">{s.price}</p>
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
              Меня зовут Настя. Я визажист-стилист по волосам из Петербурга.
              Я безумно люблю свою работу и творю красоту уже более 6-ти лет. По образованию - экономист, но поработав год в офисе, ушла полностью в бьюти. А сейчас я еще мама и жена.
              Я стараюсь всегда расти и развиваться: каждый год прохожу различные обучения по макияжам и прическам, поэтому я всегда знаю, что "в тренде".
              Если вам понравилось мое видение красоты, я  с удовольствием соберу вас на любое мероприятие! А еще я провожу уроки макияжа для тех, кто хочет научиться быстро и красиво краситься каждый день.
              Каждый клиент для меня очень важен. Я всегда делаю образы, ориентируясь на ваши пожелания, учитывая вашу внешность, на какое мероприятие идете и какой будет образ в целом. А еще я работаю на самой лучшей косметике в самых уютных и красивых студиях в центре города, чтобы вы получили максимальное наслаждение от процесса! Отзывы моих клиентов говорят сами за себя, читайте в разделе "отзывы"
            </p>
            <ul className="text-gray-400 space-y-2">
              <li>• 6+ лет опыта</li>
              <li>• 700+ клиентов</li>
              <li>• Премиум косметика</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <img
              src="/IMG_4327.JPEG"
              className="w-72 h-72 object-cover rounded-full border-4 border-gold"
              alt="Фото визажиста"
            />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-dark text-center">
        <h2 className="text-3xl text-gold mb-12">Отзывы</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <p className="text-gray-300 italic">"Лучший макияж в моей жизни!"</p>
            <p className="text-gray-500 mt-2">— Анна</p>
          </div>
          <div>
            <p className="text-gray-300 italic">"Очень стойко и красиво, рекомендую!"</p>
            <p className="text-gray-500 mt-2">— Мария</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-darkgray text-center">
        <h2 className="text-3xl text-gold mb-6">Готова записаться?</h2>
        <Link to="/booking" className="btn-primary">
          Записаться сейчас
        </Link>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-dark text-center">
        <h2 className="text-3xl text-gold mb-6">Контакты</h2>
        <p className="text-gray-300">
          📍 Санкт-Петербург <br />
          📞 +7 (965) 003-92-38 <br />
          ✉️ romancha.96@list.ru
        </p>
        <div className="mt-6 flex justify-center gap-6">
          <a href="https://instagram.com" className="text-gold">
            Instagram
          </a>
          <a href="https://t.me" className="text-gold">
            Telegram
          </a>
        </div>
      </section>
    </>
  );
}