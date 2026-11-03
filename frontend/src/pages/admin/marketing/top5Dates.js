export function parseIsoDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value, days) {
  const next = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function mondayOf(value) {
  const shift = value.getDay() === 0 ? -6 : 1 - value.getDay();
  return addDays(value, shift);
}

export function currentMondayIso() {
  return toIsoDate(mondayOf(new Date()));
}

export function normalizeMonday(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return currentMondayIso();
  return toIsoDate(mondayOf(parseIsoDate(iso)));
}

export function shiftMonday(iso, weeks) {
  return toIsoDate(addDays(parseIsoDate(iso), weeks * 7));
}

const shortRange = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const longDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

export function formatWeekTitle(mondayIso) {
  const start = parseIsoDate(mondayIso);
  const end = addDays(start, 4);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${longDate.format(end)}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${dayMonth.format(start)} – ${longDate.format(end)}`;
  }
  return `${longDate.format(start)} – ${longDate.format(end)}`;
}

export function formatWeekChip(mondayIso) {
  const start = parseIsoDate(mondayIso);
  const end = addDays(start, 4);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${shortRange.format(end)}`;
  }
  return `${shortRange.format(start)} – ${shortRange.format(end)}`;
}

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
