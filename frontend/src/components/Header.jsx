import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Instagram, Send, User } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const goToHomePage = () => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 fixed top-0 z-50 w-full">
      <div className="w-full px-6 md:px-12 lg:px-20 h-16 flex items-center justify-between">

        {/* Логотип слева */}
        <button onClick={goToHomePage} className="text-2xl font-serif font-semibold text-[#2c2c2c] hover:opacity-80 transition">
          Anastasia Romancha
        </button>

        {/* Десктопная навигация по центру */}
        <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <button onClick={goToHomePage} className="nav-link">Главная</button>
          <Link to="/portfolio" className="nav-link">Портфолио</Link>
          <Link to="/feed" className="nav-link">Бьюти-лента</Link>
          <Link to="/certificates" className="nav-link">Сертификаты</Link>
          <Link to="/articles" className="nav-link">Обучение</Link>
          <Link to="/faq" className="nav-link">FAQ</Link>
        </nav>

        {/* Иконки справа + кнопка "Записаться" */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="icon-btn"><Instagram size={20} /></a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="icon-btn"><Send size={20} /></a>
            <Link to="/profile" className="icon-btn"><User size={20} /></Link>
          </div>

          {/* Липкая кнопка "Записаться" */}
          <Link to="/booking" className="hidden md:block bg-[#4a7c59] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#2d5a3b] transition">
            Записаться
          </Link>

          {/* Бургер-меню для мобильных */}
          <div className="relative md:hidden" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="icon-btn">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white shadow-xl rounded-xl border border-gray-100 py-2 animate-fadeIn">
                <button onClick={goToHomePage} className="dropdown-item w-full text-left">Главная</button>
                <Link to="/portfolio" onClick={() => setIsMenuOpen(false)} className="dropdown-item">Портфолио</Link>
                <Link to="/feed" onClick={() => setIsMenuOpen(false)} className="dropdown-item">Бьюти-лента</Link>
                <Link to="/certificates" onClick={() => setIsMenuOpen(false)} className="dropdown-item">Сертификаты</Link>
                <Link to="/articles" onClick={() => setIsMenuOpen(false)} className="dropdown-item">Обучение</Link>
                <Link to="/faq" onClick={() => setIsMenuOpen(false)} className="dropdown-item">FAQ</Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="dropdown-item">Личный кабинет</Link>
                <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="dropdown-item text-[#4a7c59] font-medium">Записаться</Link>
                <div className="border-t border-gray-100 my-2"></div>
                <a href="https://instagram.com/anastasia.romancha" target="_blank" className="dropdown-item">Instagram</a>
                <a href="https://t.me/anastasia_romancha" target="_blank" className="dropdown-item">Telegram</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}