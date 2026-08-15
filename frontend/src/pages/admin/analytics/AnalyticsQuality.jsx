import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../../services/api';
import { formatMoney } from '../../../data/calendarConstants';
import { useAnalyticsPeriod } from '../../../hooks/useAnalyticsPeriod';

export default function AnalyticsQuality() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/quality', { params: apiParams });
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
        <h2 className="text-lg font-medium text-gray-800 mb-1">Качество трафика</h2>
        <p className="text-sm text-gray-500 mb-4">
          Конверсия и выручка по источникам — чтобы отличать объём от качества
        </p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_source.filter((r) => r.count > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) =>
                  name === 'Выручка' ? formatMoney(value) : value
                }
              />
              <Bar yAxisId="left" dataKey="completed_share" name="Конверсия %" fill="#4a7c59" />
              <Bar yAxisId="right" dataKey="revenue" name="Выручка" fill="#a67c52" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Таблица по источникам</h2>
        <p className="text-sm text-gray-500 mb-4">Средний чек и доля no-show</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Источник</th>
                <th className="px-4 py-3">Записи</th>
                <th className="px-4 py-3">Конверсия</th>
                <th className="px-4 py-3">Выручка</th>
                <th className="px-4 py-3">Ср. чек</th>
                <th className="px-4 py-3">No-show</th>
              </tr>
            </thead>
            <tbody>
              {data.by_source.map((row) => (
                <tr key={row.source} className="border-t border-gray-100">
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3">{row.count}</td>
                  <td className="px-4 py-3">{row.completed_share}%</td>
                  <td className="px-4 py-3">{formatMoney(row.revenue)}</td>
                  <td className="px-4 py-3">{formatMoney(row.average_check)}</td>
                  <td className="px-4 py-3">{row.no_show_share}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Рейтинг по выручке</h2>
          <p className="text-sm text-gray-500 mb-3">Кто приносит больше денег</p>
          <ol className="space-y-2">
            {data.ranking_by_revenue.map((row, i) => (
              <li key={row.source} className="flex justify-between text-sm border-b border-gray-100 py-2">
                <span>
                  {i + 1}. {row.label}
                </span>
                <span className="text-gray-600">{formatMoney(row.revenue)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Рейтинг по конверсии</h2>
          <p className="text-sm text-gray-500 mb-3">Кто лучше доходит до визита</p>
          <ol className="space-y-2">
            {data.ranking_by_conversion.map((row, i) => (
              <li key={row.source} className="flex justify-between text-sm border-b border-gray-100 py-2">
                <span>
                  {i + 1}. {row.label}
                </span>
                <span className="text-gray-600">{row.completed_share}%</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
