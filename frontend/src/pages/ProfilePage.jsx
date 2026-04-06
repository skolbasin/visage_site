import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, login, register, logout, isAuthenticated, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Вы успешно вошли');
      } else {
        await register(email, password, fullName);
        setSuccess('Регистрация успешна! Теперь войдите.');
        setIsLogin(true);
        setPassword('');
        setEmail('');
        setFullName('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-4xl font-serif text-[#2c2c2c] text-center mb-8">Личный кабинет</h1>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-[#4a7c59]/20 flex items-center justify-center text-2xl text-[#4a7c59] font-semibold">
                {user.full_name?.charAt(0) || user.email.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2c2c2c]">{user.full_name || 'Пользователь'}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-gray-600">
              <p><span className="font-medium">Дата регистрации:</span> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={logout} className="mt-6 flex items-center gap-2 text-red-500 hover:text-red-600 transition">
              <LogOut size={18} /> Выйти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex mb-6 border-b border-gray-100">
            <button className={`flex-1 py-2 text-center font-medium transition ${isLogin ? 'text-[#4a7c59] border-b-2 border-[#4a7c59]' : 'text-gray-400'}`} onClick={() => setIsLogin(true)}>Вход</button>
            <button className={`flex-1 py-2 text-center font-medium transition ${!isLogin ? 'text-[#4a7c59] border-b-2 border-[#4a7c59]' : 'text-gray-400'}`} onClick={() => setIsLogin(false)}>Регистрация</button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
            </div>
            <div className="relative mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Пароль"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
            </div>
            {!isLogin && (
              <div className="relative mb-4">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ваше имя"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
              </div>
            )}
            <button type="submit" className="w-full btn-primary py-3">
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}