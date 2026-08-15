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

export default function AnalyticsRevenue() {
  const { apiParams } = useAnalyticsPeriod();
  const [includeScheduled, setIncludeScheduled] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/revenue', {
          params: { ...apiParams, include_scheduled: includeScheduled },
        });
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
  }, [apiParams, includeScheduled]);

  if (loading) return <div className="text-center py-16 text-gray-500">Загрузка...</div>;
  if (!data) return <div className="text-center py-16 text-gray-500">Нет данных</div>;

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-1">Выручка и чек</h2>
            <p className="text-sm text-gray-500">Деньги по записям календаря</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeScheduled}
              onChange={(e) => setIncludeScheduled(e.target.checked)}
              className="rounded border-gray-300 text-[#4a7c59] focus:ring-[#4a7c59]"
            />
            Включая запланированные
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Выручка', value: formatMoney(data.total_revenue) },
            { label: 'Предоплаты', value: formatMoney(data.prepayments_total) },
            { label: 'К доплате', value: formatMoney(data.remaining_to_pay) },
            { label: 'Средний чек', value: formatMoney(data.average_check) },
            { label: 'Медианный чек', value: formatMoney(data.median_check) },
            { label: 'Записей в расчёте', value: data.count },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Выручка по дням</h2>
        <p className="text-sm text-gray-500 mb-4">Динамика денежных поступлений</p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
          {data.by_day?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.by_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Выручка"
                  stroke="#4a7c59"
                  fill="#4a7c5933"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Нет данных за период
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
