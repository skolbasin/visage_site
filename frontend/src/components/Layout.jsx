import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';
import QuestionModal from './QuestionModal';

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <html lang="ru" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* SEO метатеги */}
        <title>Анастасия | Визажист-стилист в Санкт-Петербурге</title>
        <meta name="description" content="Визажист-стилист в Санкт-Петербурге. Свадебный, вечерний, дневной макияж, прически, обучение. Запись онлайн. Работаю в студии и с выездом." />
        <meta name="keywords" content="визажист спб, макияж спб, прическа спб, свадебный макияж спб, визажист на дом спб, обучение макияжу спб, визажист петербург" />
        <meta name="author" content="Anastasia Romancha" />
        <meta name="geo.placename" content="Санкт-Петербург" />
        <meta name="geo.region" content="RU-SPE" />
        <meta name="geo.position" content="59.9343;30.3351" />
        <meta name="ICBM" content="59.9343, 30.3351" />

        {/* Open Graph для соцсетей */}
        <meta property="og:title" content="Анастасия | Визажист-стилист в Санкт-Петербурге" />
        <meta property="og:description" content="Профессиональный визажист в СПб. Создаю образы, в которых вы остаетесь собой. Запись онлайн." />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:url" content="https://anastasia-romancha.ru" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Анастасия | Визажист-стилист в Санкт-Петербурге" />
        <meta name="twitter:description" content="Профессиональный визажист в СПб. Создаю образы, в которых вы остаетесь собой." />
        <meta name="twitter:image" content="/og-image.jpg" />

        {/* Canonical link */}
        <link rel="canonical" href="https://anastasia-romancha.ru" />

        {/* Robots */}
        <meta name="robots" content="index, follow" />
        <meta name="yandex" content="index, follow" />

        {/* Schema.org разметка для локального бизнеса */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Anastasia Romancha - Визажист-стилист",
            "alternateName": "Визажист Анастасия",
            "image": "https://anastasia-romancha.ru/IMG_4327.JPEG",
            "telephone": "+7 (965) 003-92-38",
            "email": "romancha.96@list.ru",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Санкт-Петербург",
              "addressCountry": "RU"
            },
            "url": "https://anastasia-romancha.ru",
            "openingHours": "Mo-Su 09:00-21:00",
            "priceRange": "₽₽",
            "areaServed": {
              "@type": "City",
              "name": "Санкт-Петербург"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Услуги визажиста",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Макияж/прическа в студии",
                    "price": "5000",
                    "priceCurrency": "RUB"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Полный образ в студии",
                    "price": "8000",
                    "priceCurrency": "RUB"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Макияж/прическа с выездом",
                    "price": "7000",
                    "priceCurrency": "RUB"
                  }
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <Outlet />
        </main>
        <Footer />

        {/* Плавающая кнопка "Задать вопрос" */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#4a7c59] text-white rounded-full p-4 shadow-lg hover:bg-[#2d5a3b] transition-all duration-300 hover:scale-110 group"
          aria-label="Задать вопрос"
        >
          <MessageCircle size={24} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#2c2c2c] text-white text-sm px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Задать вопрос
          </span>
        </button>

        {/* Модальное окно */}
        <QuestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </>
  );
}