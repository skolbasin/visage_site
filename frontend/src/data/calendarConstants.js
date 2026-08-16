export const CLIENT_SOURCES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'profi', label: 'Profi' },
  { value: 'website', label: 'сайт' },
  { value: 'referral', label: 'рекомендация' },
  { value: 'returning', label: 'повторный клиент' },
  { value: 'other', label: 'другое' },
];

export const APPOINTMENT_TYPES = [
  { value: 'hair', label: 'Прическа', durationHours: 1.5 },
  { value: 'makeup', label: 'Макияж', durationHours: 1.5 },
  { value: 'look', label: 'Образ', durationHours: 2.5 },
  { value: 'trial_look', label: 'Пробный образ', durationHours: 3 },
  { value: 'wedding_look', label: 'Свадебный образ', durationHours: 2.5 },
  { value: 'self_makeup', label: 'Макияж для себя', durationHours: 3 },
];

export const WORKPLACES = [
  { value: 'studio', label: 'Студия' },
  { value: 'apartment', label: 'Квартира' },
  { value: 'hotel', label: 'Отель' },
];

export const APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Запланировано' },
  { value: 'completed', label: 'Завершено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'no_show', label: 'Не пришли' },
];

export const CANCEL_REASONS = [
  { value: 'client_cancelled', label: 'Клиент отменил' },
  { value: 'feeling_unwell', label: 'Плохое самочувствие' },
  { value: 'schedule_conflict', label: 'Несовпадение по времени' },
  { value: 'force_majeure', label: 'Форс-мажор' },
  { value: 'other', label: 'Другое' },
];

export const TYPE_COLORS = {
  hair: '#4a7c59',
  makeup: '#6b8f71',
  look: '#3d6b4f',
  trial_look: '#8f6b4a',
  wedding_look: '#a67c52',
  self_makeup: '#5a7a8c',
};

export const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
};

export function getDurationHours(type) {
  const found = APPOINTMENT_TYPES.find((t) => t.value === type);
  return found?.durationHours ?? 1.5;
}

export function hoursToMinutes(hours) {
  return Math.round(Number(hours) * 60);
}

export function minutesToHours(minutes) {
  return Math.round((Number(minutes) / 60) * 100) / 100;
}

export function getTotalDurationHoursFromValues(mainHours, guests = []) {
  const guestHours = guests.reduce((sum, guest) => {
    const hours =
      guest.duration_hours === '' || guest.duration_hours == null
        ? getDurationHours(guest.appointment_type)
        : Number(guest.duration_hours) || 0;
    return sum + hours;
  }, 0);
  const main =
    mainHours === '' || mainHours == null ? 0 : Number(mainHours) || 0;
  return main + guestHours;
}

export function getTotalPrice(mainPrice, guests = []) {
  const base = mainPrice === '' || mainPrice == null ? 0 : Number(mainPrice) || 0;
  const guestsSum = guests.reduce((sum, guest) => {
    if (guest.price === '' || guest.price == null) return sum;
    return sum + (Number(guest.price) || 0);
  }, 0);
  return base + guestsSum;
}

export function formatDuration(hours) {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (minutes === 0) return `${whole} ч`;
  if (whole === 0) return `${minutes} мин`;
  return `${whole} ч ${minutes} мин`;
}

export function formatTimeRange(startsAt, endsAt) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${fmt(start)}–${fmt(end)}`;
}

export function sourceLabel(value) {
  return CLIENT_SOURCES.find((s) => s.value === value)?.label || value;
}

export function typeLabel(value) {
  return APPOINTMENT_TYPES.find((t) => t.value === value)?.label || value;
}

export function workplaceLabel(value) {
  return WORKPLACES.find((w) => w.value === value)?.label || value;
}

export function statusLabel(value) {
  return APPOINTMENT_STATUSES.find((s) => s.value === value)?.label || value;
}

export function cancelReasonLabel(value) {
  return CANCEL_REASONS.find((r) => r.value === value)?.label || value;
}

export function toLocalInputValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatMoney(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(num);
}
