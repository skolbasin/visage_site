import { useState } from 'react';
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

  if (loading) return <div className="text-center py-20">Загрузка...</div>;

  if (isAuthenticated && user) {
    // Личный кабинет авторизованного пользователя
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gold mb-6">Личный кабинет</h1>
        <div className="bg-darkgray p-6 rounded-lg">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Имя:</strong> {user.full_name || 'Не указано'}</p>
          <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <button
            onClick={logout}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Выйти
          </button>
        </div>
        {/* Здесь позже добавим историю записей и промокоды */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-darkgray p-6 rounded-lg">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 ${isLogin ? 'border-b-2 border-gold text-gold' : 'text-gray-400'}`}
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button
            className={`flex-1 py-2 ${!isLogin ? 'border-b-2 border-gold text-gold' : 'text-gray-400'}`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>

        {error && <div className="mb-4 p-2 bg-red-900 text-red-200 rounded">{error}</div>}
        {success && <div className="mb-4 p-2 bg-green-900 text-green-200 rounded">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold outline-none"
            />
          </div>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Имя (опционально)</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 bg-dark border border-gray-700 rounded text-white focus:border-gold outline-none"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gold text-black font-bold py-2 rounded hover:bg-yellow-500 transition"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}