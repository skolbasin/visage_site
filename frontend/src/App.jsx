import { Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import FeedPage from './pages/FeedPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CertificatesPage from './pages/CertificatesPage';
import FAQPage from './pages/FAQPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminBookings from './pages/admin/AdminBookings';
import AdminFeed from './pages/admin/AdminFeed';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Основные страницы */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="faq" element={<FAQPage />} />
        </Route>

        {/* Админ-панель */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/bookings" replace />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="feed" element={<AdminFeed />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;