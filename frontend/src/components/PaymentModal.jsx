export default function PaymentModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-serif mb-2">Оплата онлайн</h3>
        <p className="text-gray-600 mb-4">Функция оплаты временно недоступна. Скоро появится!</p>
        <button onClick={onClose} className="btn-primary w-full">Закрыть</button>
      </div>
    </div>
  );
}