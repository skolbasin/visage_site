import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (id) => {
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
      className="bg-darkgray/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 z-50"
      style={{
        width: '1126px',
        maxWidth: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        height: '64px'
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">

          {/* ЛЕВО — ГЛАВНАЯ (переход на главную + скролл наверх) */}
          <button
            onClick={goToHomePage}
            className="text-gold font-bold text-lg hover:opacity-80 transition"
          >
            ANASTASIA
          </button>

          {/* НАВИГАЦИЯ */}
          <div className="flex space-x-6 overflow-x-auto">
            <button onClick={() => handleScroll('about')} className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              О себе
            </button>

            <Link to="/portfolio" className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Работы
            </Link>

            <button onClick={() => handleScroll('services')} className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Услуги
            </button>

            <Link to="/feed" className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Лента
            </Link>

            <Link to="/reviews" className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Отзывы
            </Link>

            <Link to="/articles" className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Обучение
            </Link>

            <Link to="/certificates" className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Сертификаты
            </Link>

            <button onClick={() => handleScroll('contacts')} className="text-gray-300 hover:text-gold whitespace-nowrap text-base">
              Контакты
            </button>
          </div>

          {/* ПРАВО */}
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-gray-300 hover:text-gold text-xl">
              👤
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}