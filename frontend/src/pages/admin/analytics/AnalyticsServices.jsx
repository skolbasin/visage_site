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

export default function AnalyticsServices() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/services', { params: apiParams });
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

  const chartData = data.services.filter((s) => s.count > 0);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Услуги</h2>
        <p className="text-sm text-gray-500 mb-4">
          Распределение по типам записи · занято часов: {data.total_busy_hours}
        </p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 h-80">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis yAxisId="left" allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'Выручка' ? formatMoney(value) : value
                  }
                />
                <Bar yAxisId="left" dataKey="count" name="Кол-во" fill="#4a7c59" />
                <Bar yAxisId="right" dataKey="revenue" name="Выручка" fill="#a67c52" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Нет данных
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Детали по услугам</h2>
        <p className="text-sm text-gray-500 mb-4">Длительность и загрузка часов</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Услуга</th>
                <th className="px-4 py-3">Записи</th>
                <th className="px-4 py-3">Активные</th>
                <th className="px-4 py-3">Выручка</th>
                <th className="px-4 py-3">Длит., ч</th>
                <th className="px-4 py-3">Занято, ч</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((row) => (
                <tr key={row.type} className="border-t border-gray-100">
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3">{row.count}</td>
                  <td className="px-4 py-3">{row.active_count}</td>
                  <td className="px-4 py-3">{formatMoney(row.revenue)}</td>
                  <td className="px-4 py-3">{row.duration_hours}</td>
                  <td className="px-4 py-3">{row.busy_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
