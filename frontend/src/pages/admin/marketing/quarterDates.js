function parseIsoDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(value, days) {
  const next = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(value, months) {
  const result = new Date(value.getFullYear(), value.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(value.getDate(), lastDay));
  return result;
}

export function currentQuarterIso() {
  const today = new Date();
  const month = Math.floor(today.getMonth() / 3) * 3;
  return toIsoDate(new Date(today.getFullYear(), month, 1));
}

export function normalizeQuarter(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return currentQuarterIso();
  const value = parseIsoDate(iso);
  const month = Math.floor(value.getMonth() / 3) * 3;
  return toIsoDate(new Date(value.getFullYear(), month, 1));
}

export function shiftQuarter(iso, offset) {
  return toIsoDate(addMonths(parseIsoDate(iso), offset * 3));
}

export function quarterLabel(iso) {
  const start = parseIsoDate(iso);
  const index = Math.floor(start.getMonth() / 3) + 1;
  return `${index} квартал ${start.getFullYear()}`;
}

export function quarterChip(iso) {
  const start = parseIsoDate(iso);
  const index = Math.floor(start.getMonth() / 3) + 1;
  return `${index} кв. ${start.getFullYear()}`;
}

const rangeFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

export function quarterRange(iso) {
  const start = parseIsoDate(iso);
  const end = addDays(addMonths(start, 3), -1);
  return `${rangeFormat.format(start)} – ${rangeFormat.format(end)}`;
}

export function monthLabel(iso) {
  const raw = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(parseIsoDate(iso));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function isOpeningWeek(iso, today = new Date()) {
  const start = parseIsoDate(iso);
  const today0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const limit = addDays(start, 6);
  return today0 >= start && today0 <= limit;
}
