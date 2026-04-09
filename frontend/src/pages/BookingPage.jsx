import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BookingPage() {
  const [step, setStep] = useState(1); // 1: дата/время, 2: услуга, 3: контактные данные
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

  // Доступные услуги
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

  // Заглушка занятых слотов
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-[#2c2c2c] text-center mb-4">Запись на услугу</h1>
        <p className="text-gray-500 text-center mb-8">Заполните форму, и я свяжусь с вами для подтверждения</p>

        {/* Индикатор шагов */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-[#4a7c59]' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-[#4a7c59]' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-[#4a7c59] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* ШАГ 1: Дата и время */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#2c2c2c] mb-6">Выберите дату и время</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <Calendar onChange={handleDateChange} value={date} minDate={new Date()} />
              </div>
              <div>
                <label className="block text-gray-700 mb-3 font-medium">Выберите время</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => {
                    const slotDateTime = `${date.toISOString().split('T')[0]}T${time}`;
                    const isBooked = bookedSlots.includes(slotDateTime);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => !isBooked && setTimeSlot(time)}
                        disabled={isBooked}
                        className={`py-2 rounded-lg border transition ${
                          timeSlot === time ? 'bg-[#4a7c59] text-white border-[#4a7c59]' : 'border-gray-300 text-gray-700 hover:border-[#4a7c59]'
                        } ${isBooked ? 'opacity-50 line-through cursor-not-allowed bg-gray-100' : ''}`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                {timeSlot && (
                  <p className="mt-4 text-green-600 text-sm">Выбрано: {date.toLocaleDateString()} {timeSlot}</p>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={nextStep} disabled={!timeSlot} className="btn-primary disabled:opacity-50">
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 2: Выбор услуги */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#2c2c2c] mb-6">Выберите услугу</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedService?.id === service.id
                      ? 'border-[#4a7c59] bg-[#4a7c59]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#4a7c59] hover:shadow-sm'
                  }`}
                >
                  <h3 className="font-semibold text-[#2c2c2c]">{service.name}</h3>
                  <p className="text-[#4a7c59] font-bold mt-1">{service.price}</p>
                  <p className="text-gray-400 text-sm mt-1">⏱ {service.duration}</p>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={prevStep} className="btn-secondary">← Назад</button>
              <button onClick={nextStep} disabled={!selectedService} className="btn-primary disabled:opacity-50">
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: Контактные данные */}
        {step === 3 && selectedService && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#2c2c2c] mb-6">Ваши контактные данные</h2>

            {/* Краткая информация о выбранной услуге */}
            <div className="bg-[#faf8f6] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">Выбранная услуга:</p>
              <p className="font-semibold text-[#2c2c2c]">{selectedService.name}</p>
              <p className="text-[#4a7c59] font-bold">{selectedService.price}</p>
              <p className="text-gray-400 text-sm">Дата: {date.toLocaleDateString()} в {timeSlot}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input type="text" name="name" required placeholder="Ваше имя" value={formData.name} onChange={handleChange}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
              </div>
              <div className="relative">
                <input type="tel" name="phone" required placeholder="Телефон" value={formData.phone} onChange={handleChange}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
              </div>
              <div className="relative">
                <input type="email" name="email" required placeholder="Email" value={formData.email} onChange={handleChange}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
              </div>
              <div className="relative">
                <textarea name="comment" rows="3" placeholder="Комментарий (опционально)" value={formData.comment} onChange={handleChange}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition resize-none" />
              </div>
              <div className="relative">
                <input type="text" name="promo_code" placeholder="Промокод" value={formData.promo_code} onChange={handleChange}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59] outline-none transition" />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button type="button" onClick={prevStep} className="btn-secondary">← Назад</button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? 'Отправка...' : 'Оформить услугу'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}