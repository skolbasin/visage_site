import { Link, useLocation } from 'react-router-dom';
import { Instagram, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'О себе', href: '/#about' },
  { name: 'Работы', href: '/portfolio' },
  { name: 'Услуги', href: '/#services' },
  { name: 'Макияж для себя', href: '/articles' },
  { name: 'Лента', href: '/feed' },
  { name: 'Отзывы', href: '/reviews' },
  { name: 'Подарочный сертификат', href: '/certificates' },
];

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-darkgray/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Навигация слева */}
          <div className="flex space-x-6 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-gray-300 hover:text-gold transition whitespace-nowrap ${
                  location.pathname === item.href ? 'text-gold' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Иконки справа */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link to="/profile" className="text-gray-300 hover:text-gold">
              <User className="w-5 h-5" />
            </Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 text-gray-300 hover:text-gold" />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer">
              <Send className="w-5 h-5 text-gray-300 hover:text-gold" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}