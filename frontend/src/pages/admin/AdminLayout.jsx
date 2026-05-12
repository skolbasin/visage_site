import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Calendar, Image, Settings, MessageSquare, Gift, Users, Tag, Menu, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [counts, setCounts] = useState({ bookings: 0, questions: 0, certificates: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await api.get('/admin/counts');
        setCounts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4a7c59] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user?.is_admin) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <h2 className="text-xl font-serif text-gray-800">Панель управления</h2>
        <p className="text-sm text-gray-500 mt-1">Привет, {user?.full_name || 'Админ'}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <div className="flex items-center gap-3 px-3 py-2 text-gray-700 font-medium">
            <Users size={20} />
            <span>Клиенты</span>
            {(counts.bookings + counts.questions + counts.certificates) > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {counts.bookings + counts.questions + counts.certificates}
              </span>
            )}
          </div>
          <div className="ml-6 space-y-1">
            <Link to="/admin/bookings" className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${isActive('/admin/bookings') ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              <div className="flex items-center gap-3"><Calendar size={18} /><span>Записи</span></div>
              {counts.bookings > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{counts.bookings}</span>}
            </Link>
            <Link to="/admin/certificates" className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${isActive('/admin/certificates') ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              <div className="flex items-center gap-3"><Gift size={18} /><span>Сертификаты</span></div>
              {counts.certificates > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{counts.certificates}</span>}
            </Link>
            <Link to="/admin/questions" className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${isActive('/admin/questions') ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              <div className="flex items-center gap-3"><MessageSquare size={18} /><span>Вопросы</span></div>
              {counts.questions > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{counts.questions}</span>}
            </Link>
          </div>
        </div>

        <Link to="/admin/promocodes" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${location.pathname === '/admin/promocodes' ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          <Tag size={20} /><span>Промокоды</span>
        </Link>
        <Link to="/admin/feed" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${location.pathname === '/admin/feed' ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          <Image size={20} /><span>Бьюти-лента</span>
        </Link>
        <Link to="/admin/settings" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${location.pathname === '/admin/settings' ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          <Settings size={20} /><span>Настройки</span>
        </Link>
      </nav>

      <div className="p-4 border-t mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition">
          <LogOut size={20} /><span>Выйти</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Десктопное меню */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white lg:shadow-md lg:flex lg:flex-col lg:z-10">
        <SidebarContent />
      </aside>

      {/* Мобильное выезжающее меню */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-md flex flex-col z-50
        transition-transform duration-300 ease-in-out lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* Мобильная шапка */}
      <div className="lg:hidden bg-white shadow-md fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-serif text-gray-800">Панель управления</h2>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Оверлей для мобильного меню */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Основной контент */}
      <main className="lg:pl-64">
        <div className="h-14 lg:hidden" />
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}