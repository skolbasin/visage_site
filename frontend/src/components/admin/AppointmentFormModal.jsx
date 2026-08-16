import { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CLIENT_SOURCES,
  WORKPLACES,
  formatDuration,
  formatMoney,
  getDurationHours,
  getTotalDurationHoursFromValues,
  getTotalPrice,
  hoursToMinutes,
  minutesToHours,
  toLocalInputValue,
} from '../../data/calendarConstants';

function emptyGuest() {
  return {
    name: '',
    appointment_type: 'makeup',
    price: '',
    duration_hours: String(getDurationHours('makeup')),
  };
}

function buildInitialForm(initial, defaultStartsAt) {
  if (initial) {
    return {
      name: initial.name || '',
      client_source: initial.client_source || 'instagram',
      client_source_other: initial.client_source_other || '',
      appointment_type: initial.appointment_type || 'makeup',
      contact: initial.contact || '',
      price: initial.price != null ? String(initial.price) : '',
      duration_hours: String(
        initial.duration_minutes != null
          ? minutesToHours(initial.duration_minutes)
          : getDurationHours(initial.appointment_type || 'makeup')
      ),
      starts_at: toLocalInputValue(initial.starts_at),
      has_prepayment: Boolean(initial.has_prepayment),
      prepayment_amount:
        initial.prepayment_amount != null ? String(initial.prepayment_amount) : '',
      workplace: initial.workplace || 'studio',
      comment: initial.comment || '',
      status: initial.status || 'scheduled',
      guests: (initial.guests || []).map((guest) => ({
        name: guest.name || '',
        appointment_type: guest.appointment_type || 'makeup',
        price: guest.price != null ? String(guest.price) : '',
        duration_hours: String(
          guest.duration_minutes != null
            ? minutesToHours(guest.duration_minutes)
            : getDurationHours(guest.appointment_type || 'makeup')
        ),
      })),
    };
  }
  return {
    name: '',
    client_source: 'instagram',
    client_source_other: '',
    appointment_type: 'makeup',
    contact: '',
    price: '',
    duration_hours: String(getDurationHours('makeup')),
    starts_at: toLocalInputValue(defaultStartsAt || new Date()),
    has_prepayment: false,
    prepayment_amount: '',
    workplace: 'studio',
    comment: '',
    status: 'scheduled',
    guests: [],
  };
}

function AppointmentForm({
  initial,
  defaultStartsAt,
  onClose,
  onSubmit,
  onDelete,
  saving,
}) {
  const [form, setForm] = useState(() => buildInitialForm(initial, defaultStartsAt));
  const [error, setError] = useState('');

  const durationHours = useMemo(
    () => getTotalDurationHoursFromValues(form.duration_hours, form.guests),
    [form.duration_hours, form.guests]
  );

  const totalPrice = useMemo(
    () => getTotalPrice(form.price, form.guests),
    [form.price, form.guests]
  );

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const changeMainType = (type) => {
    setForm((prev) => ({
      ...prev,
      appointment_type: type,
      duration_hours: String(getDurationHours(type)),
    }));
  };

  const updateGuest = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      guests: prev.guests.map((guest, i) => {
        if (i !== index) return guest;
        if (field === 'appointment_type') {
          return {
            ...guest,
            appointment_type: value,
            duration_hours: String(getDurationHours(value)),
          };
        }
        return { ...guest, [field]: value };
      }),
    }));
  };

  const addGuest = () => {
    setForm((prev) => ({ ...prev, guests: [...prev.guests, emptyGuest()] }));
  };

  const removeGuest = (index) => {
    setForm((prev) => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Укажите имя клиента');
      return;
    }
    if (!form.contact.trim()) {
      setError('Укажите контакты');
      return;
    }
    if (!form.workplace) {
      setError('Укажите место работы');
      return;
    }
    if (!form.starts_at) {
      setError('Укажите время записи');
      return;
    }
    if (form.price !== '' && Number(form.price) < 0) {
      setError('Стоимость не может быть отрицательной');
      return;
    }
    if (form.client_source === 'other' && !form.client_source_other.trim()) {
      setError('Укажите источник в поле «другое»');
      return;
    }
    for (const guest of form.guests) {
      if (!guest.name.trim()) {
        setError('Укажите имя дополнительного клиента');
        return;
      }
      if (guest.price !== '' && Number(guest.price) < 0) {
        setError('Стоимость доп. клиента не может быть отрицательной');
        return;
      }
      if (!guest.duration_hours || Number(guest.duration_hours) <= 0) {
        setError('Укажите длительность для каждого доп. клиента');
        return;
      }
    }
    if (!form.duration_hours || Number(form.duration_hours) <= 0) {
      setError('Укажите длительность записи');
      return;
    }
    if (form.has_prepayment) {
      const amount = Number(form.prepayment_amount);
      if (!amount || amount <= 0) {
        setError('Укажите сумму предоплаты');
        return;
      }
      if (totalPrice > 0 && amount > totalPrice) {
        setError('Предоплата не может превышать общую стоимость');
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      client_source: form.client_source,
      client_source_other:
        form.client_source === 'other' ? form.client_source_other.trim() : null,
      appointment_type: form.appointment_type,
      contact: form.contact.trim(),
      price: form.price === '' ? null : Number(form.price),
      duration_minutes: hoursToMinutes(form.duration_hours),
      starts_at: new Date(form.starts_at).toISOString(),
      has_prepayment: form.has_prepayment,
      prepayment_amount: form.has_prepayment ? Number(form.prepayment_amount) : null,
      workplace: form.workplace,
      comment: form.comment.trim() || null,
      status: form.status,
      guests: form.guests.map((guest) => ({
        name: guest.name.trim(),
        appointment_type: guest.appointment_type,
        price: guest.price === '' ? null : Number(guest.price),
        duration_minutes: hoursToMinutes(guest.duration_hours),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join('; '));
      } else {
        setError('Не удалось сохранить запись');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[95vh] overflow-y-auto bg-white sm:rounded-xl shadow-xl">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-serif text-gray-800">
            {initial ? 'Редактировать запись' : 'Новая запись'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Имя *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Откуда клиент *</span>
            <select
              value={form.client_source}
              onChange={(e) => update('client_source', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              required
            >
              {CLIENT_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {form.client_source === 'other' && (
            <label className="block">
              <span className="text-sm text-gray-600 mb-1 block">Укажите источник *</span>
              <input
                type="text"
                value={form.client_source_other}
                onChange={(e) => update('client_source_other', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Тип записи *</span>
            <select
              value={form.appointment_type}
              onChange={(e) => changeMainType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              required
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Длительность, ч *</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.duration_hours}
              onChange={(e) => update('duration_hours', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              required
            />
            <span className="text-xs text-gray-500 mt-1 block">
              По умолчанию для типа: {formatDuration(getDurationHours(form.appointment_type))}.
              Итого со всеми клиентами: {formatDuration(durationHours)}
            </span>
          </label>

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Контакты *</span>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => update('contact', e.target.value)}
              placeholder="Ссылка или номер телефона"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600 mb-1 block">Стоимость, ₽</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Если стоимость может измениться — оставьте пустым и опишите ситуацию в
                комментариях
              </span>
            </label>

            <label className="block">
              <span className="text-sm text-gray-600 mb-1 block">Время записи *</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => update('starts_at', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                required
              />
            </label>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm text-gray-700">Предоплата *</span>
              <button
                type="button"
                role="switch"
                aria-checked={form.has_prepayment}
                onClick={() => update('has_prepayment', !form.has_prepayment)}
                className={`relative w-11 h-6 rounded-full transition ${
                  form.has_prepayment ? 'bg-[#4a7c59]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
                    form.has_prepayment ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </label>
            {form.has_prepayment && (
              <label className="block">
                <span className="text-sm text-gray-600 mb-1 block">Сумма предоплаты, ₽ *</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.prepayment_amount}
                  onChange={(e) => update('prepayment_amount', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                  required
                />
              </label>
            )}
          </div>

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Место работы *</span>
            <select
              value={form.workplace}
              onChange={(e) => update('workplace', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              required
            >
              {WORKPLACES.map((place) => (
                <option key={place.value} value={place.value}>
                  {place.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-800">Доп. клиенты</div>
                <div className="text-xs text-gray-500">
                  Мама, подруги и другие в той же записи
                </div>
              </div>
              <button
                type="button"
                onClick={addGuest}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4a7c59] text-white text-sm hover:bg-[#3d6849] transition"
              >
                <Plus size={16} />
                Добавить
              </button>
            </div>

            {form.guests.map((guest, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Клиент {index + 2}</span>
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <label className="block">
                  <span className="text-sm text-gray-600 mb-1 block">Кто *</span>
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(e) => updateGuest(index, 'name', e.target.value)}
                    placeholder="Мама / подруга / ..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-600 mb-1 block">Услуга *</span>
                  <select
                    value={guest.appointment_type}
                    onChange={(e) =>
                      updateGuest(index, 'appointment_type', e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                    required
                  >
                    {APPOINTMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm text-gray-600 mb-1 block">Длительность, ч *</span>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={guest.duration_hours}
                      onChange={(e) => updateGuest(index, 'duration_hours', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-600 mb-1 block">Стоимость, ₽</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={guest.price}
                      onChange={(e) => updateGuest(index, 'price', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                    />
                  </label>
                </div>
              </div>
            ))}

            {(form.guests.length > 0 || totalPrice > 0) && (
              <div className="text-sm text-gray-700 pt-1 border-t border-gray-100">
                Итого: {formatMoney(totalPrice)} · {formatDuration(durationHours)} ·{' '}
                {1 + form.guests.length} чел.
              </div>
            )}
          </div>

          {initial && (
            <label className="block">
              <span className="text-sm text-gray-600 mb-1 block">Статус</span>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              >
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="text-sm text-gray-600 mb-1 block">Доп. комментарии</span>
            <textarea
              value={form.comment}
              onChange={(e) => update('comment', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] resize-y"
            />
          </label>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            {initial && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="sm:mr-auto px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50"
              >
                Удалить
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-lg bg-[#4a7c59] text-white hover:bg-[#3d6849] transition disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentFormModal({
  open,
  initial,
  defaultStartsAt,
  onClose,
  onSubmit,
  onDelete,
  saving,
}) {
  if (!open) return null;

  const formKey = initial
    ? `edit-${initial.id}-${(initial.guests || []).length}`
    : `create-${defaultStartsAt ? new Date(defaultStartsAt).getTime() : 'now'}`;

  return (
    <AppointmentForm
      key={formKey}
      initial={initial}
      defaultStartsAt={defaultStartsAt}
      onClose={onClose}
      onSubmit={onSubmit}
      onDelete={onDelete}
      saving={saving}
    />
  );
}
