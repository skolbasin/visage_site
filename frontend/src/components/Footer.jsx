import { Link } from 'react-router-dom';
import { Instagram, Send, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#faf8f6] border-t border-gray-200 py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#2c2c2c] mb-4">Anastasia Romancha</h3>
            <p className="text-gray-500 text-sm">Визажист-стилист из Санкт-Петербурга. Создаю образы, в которых вы остаетесь собой.</p>
          </div>
          <div>
            <h4 className="font-medium text-[#2c2c2c] mb-4">Навигация</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Услуги</button></li>
              <li><button onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>Мои работы</button></li>
              <li><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>О себе</button></li>
              <li><Link to="/portfolio">Портфолио</Link></li>
              <li><Link to="/certificates">Сертификаты</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[#2c2c2c] mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>📍 Санкт-Петербург</li>
              <li>📞 +7 (965) 003-92-38</li>
              <li>✉️ romancha.96@list.ru</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[#2c2c2c] mb-4">Соцсети</h4>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" className="text-gray-500 hover:text-[#4a7c59] transition"><Instagram size={24} /></a>
              <a href="https://t.me" target="_blank" className="text-gray-500 hover:text-[#4a7c59] transition"><Send size={24} /></a>
            </div>
          </div>
        </div>
        <div className="divider-light mt-8" />
        <div className="text-center text-gray-400 text-xs pt-6">
          <p>© 2024 Anastasia Romancha. Сделано с <Heart size={12} className="inline text-[#4a7c59]" /> для вас</p>
        </div>
      </div>
    </footer>
  );
}