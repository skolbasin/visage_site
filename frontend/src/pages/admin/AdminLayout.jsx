import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Calendar, Image, Settings, MessageSquare, Gift, Users, Tag } from 'lucide-react';
import api from '../../services/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [counts, setCounts] = useState({ bookings: 0, questions: 0, certificates: 0 });

  // Загрузка счётчиков новых объектов
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
    const interval = setInterval(fetchCounts, 30000); // обновляем каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

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
  };

  // Подсветка активного пункта (учитываем вложенные пути)
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md flex flex-col overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-xl font-serif text-gray-800">Панель управления</h2>
            <p className="text-sm text-gray-500 mt-1">Привет, {user?.full_name || 'Админ'}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {/* Родительский пункт "Клиенты" */}
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
                <Link
                  to="/admin/bookings"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                    isActive('/admin/bookings') ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={18} />
                    <span>Записи</span>
                  </div>
                  {counts.bookings > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {counts.bookings}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/certificates"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                    isActive('/admin/certificates') ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Gift size={18} />
                    <span>Сертификаты</span>
                  </div>
                  {counts.certificates > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {counts.certificates}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/questions"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                    isActive('/admin/questions') ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} />
                    <span>Вопросы</span>
                  </div>
                  {counts.questions > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {counts.questions}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Отдельные пункты меню */}
            <Link
              to="/admin/promocodes"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                location.pathname === '/admin/promocodes' ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Tag size={20} />
              <span>Промокоды</span>
            </Link>

            <Link
              to="/admin/feed"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                location.pathname === '/admin/feed' ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Image size={20} />
              <span>Бьюти-лента</span>
            </Link>

            <Link
              to="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                location.pathname === '/admin/settings' ? 'bg-[#4a7c59] text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              <span>Настройки</span>
            </Link>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition"
            >
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}