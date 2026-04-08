import { useState } from 'react';
import HeroSection from '../components/sections/HeroSection';
import PortfolioSection from '../components/sections/PortfolioSection';
import ServicesSection from '../components/sections/ServicesSection';
import StatsSection from '../components/sections/StatsSection';
import AboutSection from '../components/sections/AboutSection';
import ReviewsSection from '../components/sections/ReviewsSection';
import CTASection from '../components/sections/CTASection';
import ContactsSection from '../components/sections/ContactsSection';
import ImageModal from '../components/ImageModal';
import MapSection from '../components/sections/MapSection';

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const portfolioImages = [
    '/IMG_8514.JPG',
    '/IMG_5405.JPG',
    '/IMG_6428.PNG',
    '/IMG_7913.PNG',
    '/IMG_2578.JPG',
    '/IMG_9246.JPG',
  ];

  const openModal = (img) => {
    setSelectedImage(img);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  return (
    <div className="bg-white overflow-x-hidden">
      <HeroSection />
      <PortfolioSection images={portfolioImages} onImageClick={openModal} />
      <ServicesSection />
      <StatsSection />
      <AboutSection />
      <ReviewsSection />
      <CTASection />
      <MapSection />
      <ContactsSection />
      <ImageModal isOpen={isModalOpen} image={selectedImage} onClose={closeModal} />
    </div>
  );
}