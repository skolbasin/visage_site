import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрытие меню при клике вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    // Добавляем слушатель при открытом меню
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Очищаем слушатель при закрытии меню или размонтировании
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleScroll = (id) => {
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const goToHomePage = () => {
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className="bg-darkgray/90 backdrop-blur-md border-b border-gray-800 fixed top-0 z-50"
      style={{
        width: '1126px',
        maxWidth: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        height: '64px'
      }}
    >
      <div className="w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">

          {/* LEFT — LOGO */}
          <div className="flex-shrink-0">
            <button
              onClick={goToHomePage}
              className="text-gold font-bold text-lg tracking-wider hover:opacity-80 transition"
            >
              ANASTASIA ROMANCHA
            </button>
          </div>

          {/* CENTER — NAV (скрыто на мобильных) */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-10">
                <button onClick={() => handleScroll('portfolio')} className="nav-link text-base font-serif tracking-wide">
                  Мои работы
                </button>
                <button onClick={() => handleScroll('services')} className="nav-link text-base font-serif tracking-wide">
                  Услуги
                </button>
                <button onClick={() => handleScroll('about')} className="nav-link text-base font-serif tracking-wide">
                  О себе
                </button>
                <button onClick={() => handleScroll('contacts')} className="nav-link text-base font-serif tracking-wide">
                  Контакты
                </button>
          </nav>

          {/* RIGHT — BURGER MENU */}
          <div className="flex items-center relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="icon-btn text-2xl"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {/* DROPDOWN */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-darkgray/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg py-2 animate-fadeIn">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="dropdown-item"
                >
                  Личный кабинет
                </Link>
                <Link
                  to="/portfolio"
                  onClick={() => setIsMenuOpen(false)}
                  className="dropdown-item"
                >
                  Портфолио
                </Link>
                <Link
                  to="/certificates"
                  onClick={() => setIsMenuOpen(false)}
                  className="dropdown-item"
                >
                  Подарочные сертификаты
                </Link>
                <Link
                  to="/articles"
                  onClick={() => setIsMenuOpen(false)}
                  className="dropdown-item"
                >
                  Обучение
                </Link>
                <Link
                  to="/feed"
                  onClick={() => setIsMenuOpen(false)}
                  className="dropdown-item"
                >
                  Бьюти Лента
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}