import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: '',
    promo_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const services = [
    { id: 1, name: 'Макияж в студии', price: '5000 ₽', duration: '2 часа' },
    { id: 2, name: 'Прическа в студии', price: '4000 ₽', duration: '1.5 часа' },
    { id: 3, name: 'Полный образ (макияж + прическа) в студии', price: '8000 ₽', duration: '3 часа' },
    { id: 4, name: 'Макияж с выездом', price: '7000 ₽', duration: '2 часа' },
    { id: 5, name: 'Прическа с выездом', price: '6000 ₽', duration: '1.5 часа' },
    { id: 6, name: 'Полный образ с выездом', price: '11000 ₽', duration: '3 часа' },
    { id: 7, name: 'Обучение макияжу (1 урок)', price: '9000 ₽', duration: '3 часа' },
    { id: 8, name: 'Обучение макияжу (2 урока)', price: '15000 ₽', duration: '6 часов' },
  ];

  const bookedSlots = ['2025-04-10T10:00', '2025-04-10T14:00'];
  const availableTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setTimeSlot('');
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        service: selectedService.name,
        price: selectedService.price,
        appointment_date: `${date.toISOString().split('T')[0]}T${timeSlot}`,
        ready_by_date: `${date.toISOString().split('T')[0]}T${timeSlot}`,
      };
      await api.post('/booking', payload);
      setMessage({ type: 'success', text: 'Заявка успешно отправлена! Я свяжусь с вами в ближайшее время.' });
      setStep(1);
      setTimeSlot('');
      setSelectedService(null);
      setFormData({ name: '', phone: '', email: '', comment: '', promo_code: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Ошибка отправки' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && timeSlot) setStep(2);
    else if (step === 2 && selectedService) setStep(3);
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  return (
    <div className="min-h-screen bg-white py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-[#2c2c2c] text-center mb-3 md:mb-4">Запись на услугу</h1>
        <p className="text-gray-500 text-center mb-6 md:mb-8 text-sm md:text-base">Заполните форму, и я свяжусь с вами для подтверждения</p>

        {/* Индикатор шагов - адаптив */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${step >= 1 ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-8 md:w-12 h-0.5 ${step >= 2 ? 'bg-[#4a7c59]' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${step >= 2 ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-8 md:w-12 h-0.5 ${step >= 3 ? 'bg-[#4a7c59]' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${step >= 3 ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-3 md:p-4 rounded-xl text-sm md:text-base ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* ШАГ 1: Дата и время - исправлен адаптив */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#2c2c2c] mb-4 md:mb-6">Выберите дату и время</h2>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Календарь - полная ширина на мобильных */}
              <div className="w-full overflow-x-auto">
                <div className="flex justify-center min-w-[280px]">
                  <Calendar onChange={handleDateChange} value={date} minDate={new Date()} className="react-calendar-custom" />
                </div>
              </div>

              {/* Время - сетка 2 колонки на мобильных */}
              <div>
                <label className="block text-gray-700 mb-2 md:mb-3 font-medium text-sm md:text-base">Выберите время</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableTimes.map((time) => {
                    const slotDateTime = `${date.toISOString().split('T')[0]}T${time}`;
                    const isBooked = bookedSlots.includes(slotDateTime);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => !isBooked && setTimeSlot(time)}
                        disabled={isBooked}
                        className={`py-2 px-2 rounded-lg border transition text-sm md:text-base ${
                          timeSlot === time ? 'bg-[#4a7c59] text-white border-[#4a7c59]' : 'border-gray-300 text-gray-700 hover:border-[#4a7c59]'
                        } ${isBooked ? 'opacity-50 line-through cursor-not-allowed bg-gray-100' : ''}`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                {timeSlot && (
                  <p className="mt-3 md:mt-4 text-green-600 text-xs md:text-sm">✓ Выбрано: {date.toLocaleDateString()} в {timeSlot}</p>
                )}
              </div>
            </div>
            <div className="mt-6 md:mt-8 flex justify-end">
              <button onClick={nextStep} disabled={!timeSlot} className="btn-primary text-sm md:text-base py-2 md:py-3 px-4 md:px-6 disabled:opacity-50">
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 2: Выбор услуги - адаптив */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#2c2c2c] mb-4 md:mb-6">Выберите услугу</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className={`p-3 md:p-4 rounded-xl border-2 text-left transition-all ${
                    selectedService?.id === service.id
                      ? 'border-[#4a7c59] bg-[#4a7c59]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#4a7c59] hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-semibold text-[#2c2c2c] text-sm md:text-base">{service.name}</h3>
                  <p className="text-[#4a7c59] font-bold mt-1 text-base md:text-lg">{service.price}</p>
                  <p className="text-gray-400 text-xs md:text-sm mt-1">⏱ {service.duration}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 md:mt-8 flex justify-between">
              <button onClick={prevStep} className="btn-secondary text-sm md:text-base py-2 md:py-3 px-4 md:px-6">← Назад</button>
              <button onClick={nextStep} disabled={!selectedService} className="btn-primary text-sm md:text-base py-2 md:py-3 px-4 md:px-6 disabled:opacity-50">
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: Контактные данные - адаптив */}
        {step === 3 && selectedService && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#2c2c2c] mb-4 md:mb-6">Ваши контактные данные</h2>

            <div className="bg-[#faf8f6] rounded-xl p-3 md:p-4 mb-5 md:mb-6">
              <p className="text-xs md:text-sm text-gray-500">Выбранная услуга:</p>
              <p className="font-semibold text-[#2c2c2c] text-sm md:text-base">{selectedService.name}</p>
              <p className="text-[#4a7c59] font-bold text-sm md:text-base">{selectedService.price}</p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">📅 {date.toLocaleDateString()} в {timeSlot}</p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <input type="text" name="name" required placeholder="Ваше имя" value={formData.name} onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition text-sm md:text-base" />
              <input type="tel" name="phone" required placeholder="Телефон" value={formData.phone} onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition text-sm md:text-base" />
              <input type="email" name="email" required placeholder="Email" value={formData.email} onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition text-sm md:text-base" />
              <textarea name="comment" rows="3" placeholder="Комментарий (опционально)" value={formData.comment} onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none text-sm md:text-base" />
              <input type="text" name="promo_code" placeholder="Промокод" value={formData.promo_code} onChange={handleChange}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition text-sm md:text-base" />
            </div>

            <div className="mt-6 md:mt-8 flex justify-between">
              <button type="button" onClick={prevStep} className="btn-secondary text-sm md:text-base py-2 md:py-3 px-4 md:px-6">← Назад</button>
              <button type="submit" disabled={loading} className="btn-primary text-sm md:text-base py-2 md:py-3 px-4 md:px-6 disabled:opacity-50">
                {loading ? 'Отправка...' : 'Оформить услугу'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Дополнительные стили для календаря на мобильных */}
      <style>{`
        @media (max-width: 640px) {
          .react-calendar-custom {
            width: 100% !important;
            font-size: 12px;
          }
          .react-calendar-custom .react-calendar__navigation button {
            font-size: 12px;
            padding: 4px;
          }
          .react-calendar-custom .react-calendar__tile {
            padding: 8px 4px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}