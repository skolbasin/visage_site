import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

function toInputDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: toInputDate(from), to: toInputDate(to) };
}

export function useAnalyticsPeriod() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaults = useMemo(() => defaultRange(), []);

  const from = searchParams.get('from') || defaults.from;
  const to = searchParams.get('to') || defaults.to;

  const setPeriod = (nextFrom, nextTo) => {
    const params = new URLSearchParams(searchParams);
    params.set('from', nextFrom);
    params.set('to', nextTo);
    setSearchParams(params, { replace: true });
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setPeriod(toInputDate(start), toInputDate(end));
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
