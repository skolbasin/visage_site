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
import PrivacyPage from './pages/PrivacyPage';
import OfferPage from './pages/OfferPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminBookings from './pages/admin/AdminBookings';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminFeed from './pages/admin/AdminFeed';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminAnalyticsLayout from './pages/admin/AdminAnalyticsLayout';
import AnalyticsOverview from './pages/admin/analytics/AnalyticsOverview';
import AnalyticsSources from './pages/admin/analytics/AnalyticsSources';
import AnalyticsFunnel from './pages/admin/analytics/AnalyticsFunnel';
import AnalyticsOutcomes from './pages/admin/analytics/AnalyticsOutcomes';
import AnalyticsQuality from './pages/admin/analytics/AnalyticsQuality';
import AnalyticsRevenue from './pages/admin/analytics/AnalyticsRevenue';
import AnalyticsServices from './pages/admin/analytics/AnalyticsServices';
import AnalyticsGroups from './pages/admin/analytics/AnalyticsGroups';

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
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="offer" element={<OfferPage />} />
        </Route>

        {/* Админ-панель */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/bookings" replace />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="analytics" element={<AdminAnalyticsLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AnalyticsOverview />} />
            <Route path="sources" element={<AnalyticsSources />} />
            <Route path="funnel" element={<AnalyticsFunnel />} />
            <Route path="outcomes" element={<AnalyticsOutcomes />} />
            <Route path="quality" element={<AnalyticsQuality />} />
            <Route path="revenue" element={<AnalyticsRevenue />} />
            <Route path="services" element={<AnalyticsServices />} />
            <Route path="groups" element={<AnalyticsGroups />} />
          </Route>
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="promocodes" element={<AdminPromoCodes />} />
          <Route path="feed" element={<AdminFeed />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;