import { X } from 'lucide-react';

export default function ImageModal({ isOpen, image, onClose }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="relative max-w-4xl">
        <button onClick={onClose} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-[#4a7c59] transition">✕</button>
        <img src={image} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()} />
      </div>
    </div>
  );
}