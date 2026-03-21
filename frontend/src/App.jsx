// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import FeedPage from './pages/FeedPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ReviewsPage from './pages/ReviewsPage';
import CertificatesPage from './pages/CertificatesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;