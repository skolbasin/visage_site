import { X } from 'lucide-react';

export default function ImageModal({ isOpen, image, onClose }) {
  if (!isOpen || !image) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="relative max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#4a7c59] transition border-2 border-black hover:border-[#4a7c59] z-30"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>
        <img
          src={image}
          alt="Увеличенное фото"
          className="w-full max-h-[90vh] object-contain rounded-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}