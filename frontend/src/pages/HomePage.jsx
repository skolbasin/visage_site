import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1));

  const openModal = (img) => {
    setSelectedImage(img);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = '';
  };
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) closeModal(); };

  const services = [
    { name: 'Макияж/прическа в студии', price: 'от 5000 ₽', desc: 'Стойкий образ на весь день' },
    { name: 'Полный образ (макияж и прическа) в студии', price: 'от 8000 ₽', desc: 'Идеален для мероприятий' },
    { name: 'Макияж/прическа с выездом', price: 'от 7000 ₽', desc: 'Лёгкий и естественный' },
  ];

  return (
    <div className="bg-white">
      {/* HERO */}
      <section
        className="relative flex items-center min-h-screen overflow-hidden w-full"
        style={{
          backgroundImage: "url('/IMG_4177.JPG')",
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#ffffff',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent" />
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20">
          <div className="max-w-lg ml-0 md:-ml-4 mt-8 md:mt-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2c2c2c] leading-tight font-serif">
              Создаю эстетичные выразительные образы, в которых ты остаешься собой
            </h1>
            <p className="mt-4 text-gray-600 text-base md:text-lg">
              Образы для клиентов, сборы невест, обучение макияжу
            </p>
            <p className="mt-3 text-gray-500 text-sm">
              6+ лет опыта • 1000+ клиентов • премиум косметика
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/booking" className="btn-primary">Записаться</Link>
              <Link to="/portfolio" className="btn-secondary">Портфолио</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-light" />

      {/* SOCIAL PROOF */}
      <section className="py-16 bg-white text-center w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
            <div><p className="text-3xl text-[#4a7c59] font-bold">6+</p><p className="text-gray-500">лет опыта</p></div>
            <div><p className="text-3xl text-[#4a7c59] font-bold">1000+</p><p className="text-gray-500">клиентов</p></div>
            <div><p className="text-3xl text-[#4a7c59] font-bold">100%</p><p className="text-gray-500">довольных</p></div>
          </div>
        </div>
      </section>

      <div className="divider-light" />

        {/* PORTFOLIO */}
        <section id="portfolio" className="py-24 bg-white w-full">
          <div className="px-6 md:px-12 lg:px-20">
            <h2 className="text-3xl font-serif text-[#2c2c2c] text-center mb-4">Мои работы</h2>
            <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">Каждая работа — это история, созданная с любовью и вниманием к деталям</p>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => openModal(img)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={img}
                        alt={`Работа ${idx + 1}`}
                        className="w-full h-96 object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* SERVICES */}
      <section id="services" className="py-24 bg-white w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl font-serif text-[#2c2c2c] text-center mb-4">Услуги</h2>
          <p className="text-gray-500 text-center mb-12">Выберите идеальный вариант для вашего образа</p>
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {services.map((s,i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
                <h3 className="text-xl font-bold text-[#2c2c2c] mb-2">{s.name}</h3>
                <p className="text-gray-500 mb-4">{s.desc}</p>
                <ul className="text-gray-400 text-sm mb-6 space-y-1"><li>• Подбор образа</li><li>• Премиум косметика</li><li>• Стойкость весь день</li></ul>
                <p className="text-[#4a7c59] text-xl font-bold mb-6">{s.price}</p>
                <Link to="/booking" className="block text-center btn-primary">Записаться</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-light" />

      {/* ABOUT */}
      <section id="about" className="py-24 bg-white w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif text-[#2c2c2c] mb-6">Обо мне</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Меня зовут Настя. Я визажист-стилист по волосам из Петербурга.
                Я безумно люблю свою работу и творю красоту уже более 6-ти лет.
                Всегда расту и развиваюсь: каждый год прохожу различные обучения у ТОПовых мастеров России по макияжам и прическам, поэтому я всегда знаю, что "в тренде".
                За годы работы я отлично развила в себе такое качество, как "насмотренность", поэтому часто слышу от своих клиентов фразу "как красиво ты меня увидела".
                Для каждого клиента у меня индивидуальный подход, я не просто крашу и укладываю, а еще и погружаюсь в ваш образ, ориентируясь на ваши пожелания, учитывая вашу внешность, какие детали в образе и на какое мероприятие идете. Работаю в самых уютных и красивых студиях в центре города, чтобы вы получили максимальное наслаждение от процесса! Отзывы моих клиентов говорят сами за себя, читайте в разделе "отзывы".
              </p>
              <ul className="text-gray-500 space-y-2">
                <li>• 6+ лет опыта</li>
                <li>• 1000+ клиентов</li>
                <li>• Премиум косметика</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <img src="/IMG_4327.JPEG" className="w-72 h-72 object-cover rounded-full border-4 border-[#4a7c59]/30 shadow-lg object-[50%_25%]" alt="Фото визажиста" />
            </div>
          </div>
        </div>
      </section>

      <div className="divider-light" />

      {/* REVIEWS */}
      <section className="py-24 bg-white text-center w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl font-serif text-[#2c2c2c] mb-4">Отзывы</h2>
          <p className="text-gray-500 mb-12">Что говорят мои клиенты</p>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-[#faf8f6] p-6 rounded-2xl">
              <div className="flex justify-center mb-3"><div className="flex text-[#4a7c59]">★★★★★</div></div>
              <p className="text-gray-700 italic">"Лучший макияж в моей жизни! Всё было идеально, макияж продержался весь день. Спасибо большое!"</p>
              <p className="text-gray-500 mt-3">— Анна</p>
            </div>
            <div className="bg-[#faf8f6] p-6 rounded-2xl">
              <div className="flex justify-center mb-3"><div className="flex text-[#4a7c59]">★★★★★</div></div>
              <p className="text-gray-700 italic">"Очень стойко и красиво, рекомендую! Настя учла все мои пожелания и сделала образ мечты."</p>
              <p className="text-gray-500 mt-3">— Мария</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-light" />

      {/* CTA */}
      <section className="py-24 bg-[#faf8f6] text-center w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl font-serif text-[#2c2c2c] mb-4">Готова записаться?</h2>
          <p className="text-gray-500 mb-8">Давайте создадим ваш идеальный образ вместе</p>
          <Link to="/booking" className="btn-primary inline-block">Записаться сейчас</Link>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-white text-center w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl font-serif text-[#2c2c2c] mb-6">Контакты</h2>
          <p className="text-gray-600">📍 Санкт-Петербург <br />📞 +7 (965) 003-92-38 <br />✉️ romancha.96@list.ru</p>
          <div className="mt-6 flex justify-center gap-6">
            <a href="https://instagram.com" className="text-[#4a7c59] hover:text-[#2d5a3b] transition">Instagram</a>
            <a href="https://t.me" className="text-[#4a7c59] hover:text-[#2d5a3b] transition">Telegram</a>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
          <div className="relative max-w-4xl">
            <button onClick={closeModal} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition">✕</button>
            <img src={selectedImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}