import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BookingPage() {
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', comment: '', promo_code: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Заглушка занятых слотов
  const bookedSlots = ['2025-04-10T10:00', '2025-04-10T14:00'];
  const availableTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setTimeSlot('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        appointment_date: `${date.toISOString().split('T')[0]}T${timeSlot}`,
        ready_by_date: `${date.toISOString().split('T')[0]}T${timeSlot}`, // упрощённо
      };
      await api.post('/booking', payload);
      setMessage({ type: 'success', text: 'Заявка отправлена!' });
      setFormData({ name: '', phone: '', email: '', comment: '', promo_code: '' });
      setTimeSlot('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-serif text-[#2c2c2c] text-center mb-4">Запись на услугу</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Календарь */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <Calendar onChange={handleDateChange} value={date} minDate={new Date()} />
            {timeSlot && <p className="mt-4 text-green-600">Выбрано: {date.toLocaleDateString()} {timeSlot}</p>}
          </div>
          {/* Выбор времени */}
          <div>
            <label className="block text-gray-700 mb-2">Выберите время</label>
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
                    } ${isBooked ? 'opacity-50 line-through cursor-not-allowed' : ''}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {/* Остальная форма (имя, телефон и т.д.) – оставляем как есть */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* поля формы */}
          <button type="submit" disabled={!timeSlot || loading} className="btn-primary w-full">Записаться</button>
        </form>
      </div>
    </div>
  );
}