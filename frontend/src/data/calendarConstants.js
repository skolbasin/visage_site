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

export const APPOINTMENT_STATUSES = [
  { value: 'scheduled', label: 'Запланировано' },
  { value: 'completed', label: 'Завершено' },
  { value: 'cancelled', label: 'Отменено' },
  { value: 'no_show', label: 'Не пришли' },
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

export function formatDuration(hours) {
  if (hours === Math.floor(hours)) return `${hours} ч`;
  return `${hours} ч`;
}

export function sourceLabel(value) {
  return CLIENT_SOURCES.find((s) => s.value === value)?.label || value;
}

export function typeLabel(value) {
  return APPOINTMENT_TYPES.find((t) => t.value === value)?.label || value;
}

export function statusLabel(value) {
  return APPOINTMENT_STATUSES.find((s) => s.value === value)?.label || value;
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
