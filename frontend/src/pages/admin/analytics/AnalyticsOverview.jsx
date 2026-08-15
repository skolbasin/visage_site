import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../../services/api';
import { formatMoney } from '../../../data/calendarConstants';
import { useAnalyticsPeriod } from '../../../hooks/useAnalyticsPeriod';

function Kpi({ label, value, hint }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0 sm:border-0 sm:py-0">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

export default function AnalyticsOverview() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/overview', { params: apiParams });
        if (!cancelled) setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiParams]);

  if (loading) return <div className="text-center py-16 text-gray-500">Загрузка...</div>;
  if (!data) return <div className="text-center py-16 text-gray-500">Нет данных</div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Ключевые показатели</h2>
        <p className="text-sm text-gray-500 mb-4">Сводка по выбранному периоду</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white rounded-xl border border-gray-100 p-5">
          <Kpi label="Всего записей" value={data.total} />
          <Kpi label="Завершено" value={data.completed} hint={`Отмен: ${data.cancelled}`} />
          <Kpi label="Выручка" value={formatMoney(data.revenue)} hint="Только завершённые" />
          <Kpi
            label="Средний чек"
            value={formatMoney(data.average_check)}
            hint={`Предоплата: ${data.prepayment_share}%`}
          />
        </div>
        {data.top_source && (
          <p className="text-sm text-gray-600 mt-3">
            Топ-источник: <span className="font-medium">{data.top_source.label}</span> (
            {data.top_source.count})
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Динамика записей</h2>
        <p className="text-sm text-gray-500 mb-4">Количество новых записей по дням</p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
          {data.timeline?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Записи"
                  stroke="#4a7c59"
                  fill="#4a7c5933"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Нет записей за период
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
