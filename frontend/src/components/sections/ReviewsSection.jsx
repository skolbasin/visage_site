import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '../OptimizedImage';

const reviewImages = [
  '/IMG_8861.png',
  '/IMG_8864.png',
  '/IMG_8865.png',
  '/IMG_8859.png',
  '/IMG_8857.png',
  '/IMG_20260406_230815_751.png',
  '/IMG_8866.png',
];

const beforeAfterPairs = [
  { before: '/IMG_20260412_123957_999.jpg', after: '/portfolio/4.jpg' },
  { before: '/IMG_20260412_123945_194.jpg', after: '/portfolio/2.jpg' },
  { before: '/IMG_20260412_124209_629.jpg', after: '/portfolio/12.jpg' },
  { before: '/IMG_20260412_123932_322.jpg', after: '/portfolio/16.jpg' },
  { before: '/IMG_20260416_230646_983.jpg', after: '/portfolio/26.jpg' },
  { before: '/IMG_20260412_123945_194.jpg', after: '/portfolio/2.jpg' },
  { before: '/IMG_20260412_124209_629.jpg', after: '/portfolio/12.jpg' },
];

export default function ReviewsSection() {
  const [selectedPair, setSelectedPair] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const openModal = (index) => {
    setSelectedPair(beforeAfterPairs[index]);
    setActivePhotoIndex(0);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPair(null);
    setActivePhotoIndex(0);
    document.body.style.overflow = '';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const nextPhoto = () => setActivePhotoIndex(prev => prev === 0 ? 1 : 0);
  const prevPhoto = () => setActivePhotoIndex(prev => prev === 0 ? 1 : 0);

  return (
    <section className="py-16 md:py-20 bg-[#faf8f6] text-center w-full relative overflow-hidden">
      <div className="px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block bg-white rounded-2xl px-6 sm:px-8 md:px-12 py-6 sm:py-8 shadow-md border border-gray-100">
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-3 inline-block">
                  Отзывы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full"></span>
                </span>
              </h2>
            </div>
            <p className="text-gray-500 text-center text-sm sm:text-base">Что говорят мои клиенты</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {reviewImages.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <OptimizedImage src={img} alt={`Отзыв ${idx + 1}`} className="w-full h-auto object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-white text-xs sm:text-sm font-medium bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Посмотреть ДО/ПОСЛЕ</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 sm:gap-4">
            {reviewImages.slice(4, 7).map((img, idx) => (
              <div
                key={idx + 4}
                className="w-1/3 max-w-xs group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => openModal(idx + 4)}
              >
                <OptimizedImage src={img} alt={`Отзыв ${idx + 5}`} className="w-full h-auto object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-white text-xs sm:text-sm font-medium bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Посмотреть ДО/ПОСЛЕ</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs sm:text-sm mt-8">
            *Более 50+ отзывов в{' '}
            <a href="#" className="text-[#4a7c59] hover:text-[#2d5a3b] transition underline decoration-transparent hover:decoration-[#4a7c59]">Instagram</a>
            {' и '}
            <a href="https://t.me/anastasia_romancha" className="text-[#4a7c59] hover:text-[#2d5a3b] transition underline decoration-transparent hover:decoration-[#4a7c59]">Telegram</a>
          </p>
        </div>
      </div>

      {isModalOpen && selectedPair && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
          <div className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button onClick={closeModal} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white rounded-full p-1.5 sm:p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition md:hidden">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition md:hidden">
              <ChevronRight size={20} />
            </button>

            <div className="md:hidden flex justify-center gap-2 pt-3 pb-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activePhotoIndex === 0 ? 'bg-[#4a7c59] w-4' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${activePhotoIndex === 1 ? 'bg-[#4a7c59] w-4' : 'bg-gray-300'}`} />
            </div>

            <div className="hidden md:flex flex-row">
              <div className="md:w-1/2 p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">ДО</p>
                <img src={selectedPair.before} alt="ДО" className="w-full h-auto max-h-[500px] object-contain rounded-xl" />
              </div>
              <div className="md:w-1/2 p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">ПОСЛЕ</p>
                <img src={selectedPair.after} alt="ПОСЛЕ" className="w-full h-auto max-h-[500px] object-contain rounded-xl" />
              </div>
            </div>

            <div className="md:hidden">
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">{activePhotoIndex === 0 ? 'ДО' : 'ПОСЛЕ'}</p>
                <img src={activePhotoIndex === 0 ? selectedPair.before : selectedPair.after} alt={activePhotoIndex === 0 ? 'ДО' : 'ПОСЛЕ'} className="w-full h-auto max-h-[60vh] object-contain rounded-xl" />
              </div>
            </div>

            <div className="p-4 text-center border-t border-gray-100">
              <p className="text-gray-600 text-sm sm:text-base">Результат работы над образом клиента</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}