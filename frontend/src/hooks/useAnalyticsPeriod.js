import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

const CACHE_KEY = 'analytics_period_v1';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

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
  if (
    d.getFullYear() !== y ||
    d.getMonth() !== m - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

/** Calendar-aware month add (clamps day if target month is shorter). */
function addCalendarMonths(date, months) {
  const result = new Date(date.getTime());
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function addDays(date, days) {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Default: today → last day of current month. */
function defaultRange() {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  return { from: toInputDate(from), to: toInputDate(endOfMonth(from)) };
}

function loadCachedPeriod() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const { from, to, savedAt } = parsed;
    if (
      typeof savedAt !== 'number' ||
      Date.now() - savedAt > CACHE_TTL_MS ||
      !parseInputDate(from) ||
      !parseInputDate(to)
    ) {
      return null;
    }
    return { from, to };
  } catch {
    return null;
  }
}

function saveCachedPeriod(from, to) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ from, to, savedAt: Date.now() })
    );
  } catch {
    // ignore quota / private mode
  }
}

function resolvePeriod(urlFrom, urlTo) {
  if (parseInputDate(urlFrom) && parseInputDate(urlTo)) {
    return { from: urlFrom, to: urlTo, fromUrl: true };
  }
  const cached = loadCachedPeriod();
  if (cached) {
    return { ...cached, fromUrl: false };
  }
  return { ...defaultRange(), fromUrl: false };
}

/**
 * @param {'week'|'month'|'quarter'|'year'} preset
 * @param {string} fromValue
 */
function computePresetEnd(preset, fromValue) {
  const start = parseInputDate(fromValue) || new Date();
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'week':
      return toInputDate(addDays(start, 7));
    case 'month':
      return toInputDate(addCalendarMonths(start, 1));
    case 'quarter':
      return toInputDate(addCalendarMonths(start, 3));
    case 'year':
      return toInputDate(addCalendarMonths(start, 12));
    default:
      return toInputDate(endOfMonth(start));
  }
}

export function useAnalyticsPeriod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');
  const syncedRef = useRef(false);

  const resolved = useMemo(
    () => resolvePeriod(urlFrom, urlTo),
    [urlFrom, urlTo]
  );
  const { from, to } = resolved;

  const setPeriod = (nextFrom, nextTo) => {
    const safeFrom = parseInputDate(nextFrom)
      ? nextFrom
      : defaultRange().from;
    const safeTo = parseInputDate(nextTo) ? nextTo : defaultRange().to;
    saveCachedPeriod(safeFrom, safeTo);
    const params = new URLSearchParams(searchParams);
    params.set('from', safeFrom);
    params.set('to', safeTo);
    setSearchParams(params, { replace: true });
  };

  // Put cache/default into the URL once so tabs and shareable links stay in sync
  useEffect(() => {
    if (syncedRef.current) {
      return;
    }
    if (!parseInputDate(urlFrom) || !parseInputDate(urlTo)) {
      syncedRef.current = true;
      setPeriod(from, to);
    } else {
      syncedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Extend `to` from current `from` by a calendar period. */
  const applyPreset = (preset) => {
    const end = computePresetEnd(preset, from);
    setPeriod(from, end);
  };

  const apiParams = useMemo(() => {
    const fromDate = new Date(`${from}T00:00:00`);
    const toDate = new Date(`${to}T23:59:59`);
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    };
  }, [from, to]);

  return { from, to, setPeriod, applyPreset, apiParams };
}
