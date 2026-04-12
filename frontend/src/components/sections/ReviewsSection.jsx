import { useState } from 'react';
import { X } from 'lucide-react';

// 7 фото-превью (отзывы)
const reviewImages = [
  '/IMG_8861.png',
  '/IMG_8864.png',
  '/IMG_8865.png',
  '/IMG_8859.png',
  '/IMG_8857.png',
  '/IMG_20260406_230815_751.png',
  '/IMG_8866.png',
];

// Пары ДО/ПОСЛЕ для каждого отзыва (в том же порядке, что и превью)
const beforeAfterPairs = [
  { before: '/IMG_20260412_123957_999.jpg', after: '/IMG_20260412_123958_004.jpg' },      // для 1-го отзыва
  { before: '/IMG_20260412_123945_194.jpg', after: '/IMG_20260412_123945_182.jpg' },  // для 2-го
  { before: '/IMG_20260412_124209_629.jpg', after: '/IMG_20260412_123942_222.jpg' },    // для 3-го
  { before: '/IMG_20260412_123932_322.jpg', after: '/IMG_20260412_123932_327.jpg' },      // для 4-го
  { before: '/IMG_20260412_123957_999.jpg', after: '/IMG_20260412_123958_004.jpg' },      // для 5-го
  { before: '/IMG_20260412_123945_194.jpg', after: '/IMG_20260412_123945_182.jpg' },      // для 6-го
  { before: '/IMG_20260412_124209_629.jpg', after: '/IMG_20260412_123942_222.jpg' },      // для 7-го
];

export default function ReviewsSection() {
  const [selectedPair, setSelectedPair] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index) => {
    setSelectedPair(beforeAfterPairs[index]);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPair(null);
    document.body.style.overflow = '';
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <section className="py-16 md:py-20 bg-[#faf8f6] text-center w-full relative overflow-hidden">
      <div className="px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block bg-white rounded-2xl px-8 md:px-12 py-8 shadow-md border border-gray-100">
            <div className="text-center mb-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] inline-block group">
                <span className="relative pb-3 inline-block">
                  Отзывы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#4a7c59] to-[#8bbd9b] transition-all duration-500 group-hover:w-full"></span>
                </span>
              </h2>
            </div>
            <p className="text-gray-500 text-center">Что говорят мои клиенты</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {reviewImages.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => openModal(idx)}
              >
                <img src={img} alt={`Отзыв ${idx + 1}`} className="w-full h-auto object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Посмотреть ДО/ПОСЛЕ</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4">
            {reviewImages.slice(4, 7).map((img, idx) => (
              <div
                key={idx + 4}
                className="w-1/3 max-w-xs group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => openModal(idx + 4)}
              >
                <img src={img} alt={`Отзыв ${idx + 5}`} className="w-full h-auto object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Посмотреть ДО/ПОСЛЕ</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ссылки с учётом РФ */}
          <p className="text-center text-gray-400 text-sm mt-8">
            *Более 50+ отзывов в{' '}
            <a
              href="#"
              className="text-[#4a7c59] hover:text-[#2d5a3b] transition underline decoration-transparent hover:decoration-[#4a7c59]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            {' и '}
            <a
              href="https://t.me/anastasia_romancha"
              className="text-[#4a7c59] hover:text-[#2d5a3b] transition underline decoration-transparent hover:decoration-[#4a7c59]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
          </p>
        </div>
      </div>

      {/* Модальное окно ДО/ПОСЛЕ */}
      {isModalOpen && selectedPair && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
          <div className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">ДО</p>
                <img src={selectedPair.before} alt="ДО" className="w-full h-auto max-h-[500px] object-contain rounded-xl" />
              </div>
              <div className="md:w-1/2 p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">ПОСЛЕ</p>
                <img src={selectedPair.after} alt="ПОСЛЕ" className="w-full h-auto max-h-[500px] object-contain rounded-xl" />
              </div>
            </div>
            <div className="p-4 text-center border-t border-gray-100">
              <p className="text-gray-600">Результат работы над образом клиента</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}