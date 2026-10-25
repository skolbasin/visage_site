import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const PERIODS = ['day', 'week', 'month', 'quarter', 'year', 'custom'];

function toInputDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseInputDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [y, m, day] = value.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  if (d.getFullYear() !== y || d.getMonth() !== m - 1 || d.getDate() !== day) {
    return null;
  }
  return d;
}

function startOfWeek(d) {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const weekday = result.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  result.setDate(result.getDate() + diff);
  return result;
}

function endOfWeek(d) {
  const start = startOfWeek(d);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function startOfQuarter(d) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

function endOfQuarter(d) {
  const start = startOfQuarter(d);
  return new Date(start.getFullYear(), start.getMonth() + 3, 0);
}

function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1);
}

function endOfYear(d) {
  return new Date(d.getFullYear(), 11, 31);
}

function addMonths(d, months) {
  const day = d.getDate();
  const next = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, last));
  return next;
}

function rangeForPeriod(period, anchor) {
  if (period === 'week') {
    return { from: startOfWeek(anchor), to: endOfWeek(anchor) };
  }
  if (period === 'month') {
    return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
  }
  if (period === 'quarter') {
    return { from: startOfQuarter(anchor), to: endOfQuarter(anchor) };
  }
  if (period === 'year') {
    return { from: startOfYear(anchor), to: endOfYear(anchor) };
  }
  return { from: anchor, to: anchor };
}

function shiftAnchor(period, fromDate, toDate, direction) {
  if (period === 'day') {
    const next = new Date(fromDate);
    next.setDate(next.getDate() + direction);
    return next;
  }
  if (period === 'week') {
    const next = new Date(fromDate);
    next.setDate(next.getDate() + direction * 7);
    return next;
  }
  if (period === 'month') {
    return addMonths(fromDate, direction);
  }
  if (period === 'quarter') {
    return addMonths(fromDate, direction * 3);
  }
  if (period === 'year') {
    return addMonths(fromDate, direction * 12);
  }
  const days = Math.round((toDate - fromDate) / 86400000) + 1;
  const next = new Date(fromDate);
  next.setDate(next.getDate() + direction * days);
  return next;
}

export function useExpensePeriod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const rawPeriod = searchParams.get('period');
  const period = PERIODS.includes(rawPeriod) ? rawPeriod : 'day';
  const urlFrom = parseInputDate(searchParams.get('from'));
  const urlTo = parseInputDate(searchParams.get('to'));

  const range = useMemo(() => {
    if (period === 'custom' && urlFrom && urlTo && urlTo >= urlFrom) {
      return { from: urlFrom, to: urlTo };
    }
    if (period === 'custom') {
      return { from: today, to: today };
    }
    const anchor = urlFrom || today;
    return rangeForPeriod(period, anchor);
  }, [period, urlFrom, urlTo, today]);

  const from = toInputDate(range.from);
  const to = toInputDate(range.to);

  const apply = (nextPeriod, nextFrom, nextTo) => {
    const params = new URLSearchParams(searchParams);
    params.set('period', nextPeriod);
    params.set('from', toInputDate(nextFrom));
    params.set('to', toInputDate(nextTo));
    setSearchParams(params, { replace: true });
  };

  const setPeriodType = (nextPeriod) => {
    if (nextPeriod === 'custom') {
      apply('custom', range.from, range.to);
      return;
    }
    const next = rangeForPeriod(nextPeriod, range.from);
    apply(nextPeriod, next.from, next.to);
  };

  const setCustomRange = (nextFrom, nextTo) => {
    const parsedFrom = parseInputDate(nextFrom) || range.from;
    const parsedTo = parseInputDate(nextTo) || range.to;
    apply('custom', parsedFrom, parsedTo < parsedFrom ? parsedFrom : parsedTo);
  };

  const shift = (direction) => {
    const anchor = shiftAnchor(period, range.from, range.to, direction);
    if (period === 'custom') {
      const days = Math.round((range.to - range.from) / 86400000);
      const nextTo = new Date(anchor);
      nextTo.setDate(anchor.getDate() + days);
      apply('custom', anchor, nextTo);
      return;
    }
    const next = rangeForPeriod(period, anchor);
    apply(period, next.from, next.to);
  };

  return {
    period,
    from,
    to,
    setPeriodType,
    setCustomRange,
    shift,
    isSingleDay: from === to,
  };
}
