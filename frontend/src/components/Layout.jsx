import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';
import QuestionModal from './QuestionModal';
import CookieBanner from './CookieBanner';

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <html lang="ru" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Анастасия | Визажист-стилист в Санкт-Петербурге</title>
        <meta name="description" content="Визажист-стилист в Санкт-Петербурге. Свадебный, вечерний, дневной макияж, прически, обучение. Запись онлайн." />
        <meta name="keywords" content="визажист спб, макияж спб, прическа спб, свадебный макияж спб" />
        <meta name="geo.placename" content="Санкт-Петербург" />
        <meta name="geo.region" content="RU-SPE" />

        <meta property="og:title" content="Анастасия | Визажист-стилист в Санкт-Петербурге" />
        <meta property="og:description" content="Профессиональный визажист в СПб. Создаю образы, в которых вы остаетесь собой." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-16">
          <Outlet />
        </main>
        <Footer />

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

        <div className="fixed bottom-6 left-6 z-40 hidden md:block">
          <Link to="/faq" className="bg-white text-[#4a7c59] border border-[#4a7c59] rounded-full px-4 py-2 text-sm shadow-md hover:bg-[#4a7c59] hover:text-white transition">
            FAQ
          </Link>
        </div>

        <QuestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <CookieBanner />
      </div>
    </>
  );
}
