import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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

          {/* Навигация */}
          <div className="flex space-x-6 overflow-x-auto">

            <button onClick={() => handleScroll('about')} className="text-gray-300 hover:text-gold">
              О себе
            </button>

            <Link to="/portfolio" className="text-gray-300 hover:text-gold">
              Работы
            </Link>

            <button onClick={() => handleScroll('services')} className="text-gray-300 hover:text-gold">
              Услуги
            </button>

            <Link to="/articles" className="text-gray-300 hover:text-gold">
              Макияж для себя
            </Link>

            <Link to="/feed" className="text-gray-300 hover:text-gold">
              Лента
            </Link>

            <Link to="/reviews" className="text-gray-300 hover:text-gold">
              Отзывы
            </Link>

            <Link to="/certificates" className="text-gray-300 hover:text-gold">
              Сертификат
            </Link>

            <button onClick={() => handleScroll('contacts')} className="text-gray-300 hover:text-gold">
              Контакты
            </button>

          </div>

          {/* Иконки */}
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="text-gray-300 hover:text-gold">
              👤
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}