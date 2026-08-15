import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../../services/api';
import { useAnalyticsPeriod } from '../../../hooks/useAnalyticsPeriod';

const COLORS = ['#4a7c59', '#6b8f71', '#3d6b4f', '#8f6b4a', '#5a7a8c', '#a67c52'];

export default function AnalyticsSources() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/sources', { params: apiParams });
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

  const chartData = data.sources.filter((s) => s.count > 0);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Источники трафика</h2>
        <p className="text-sm text-gray-500 mb-4">
          Откуда приходят клиенты · всего {data.total}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ label, share }) => `${label} ${share}%`}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Нет данных
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Сейчас" fill="#4a7c59" />
                <Bar dataKey="previous_count" name="Прошлый период" fill="#c5d5c9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Детализация</h2>
        <p className="text-sm text-gray-500 mb-4">Сравнение с предыдущим периодом той же длины</p>
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Источник</th>
                <th className="px-4 py-3">Кол-во</th>
                <th className="px-4 py-3">Доля</th>
                <th className="px-4 py-3">Было</th>
                <th className="px-4 py-3">Изменение</th>
              </tr>
            </thead>
            <tbody>
              {data.sources.map((row) => (
                <tr key={row.source} className="border-t border-gray-100">
                  <td className="px-4 py-3">{row.label}</td>
                  <td className="px-4 py-3">{row.count}</td>
                  <td className="px-4 py-3">{row.share}%</td>
                  <td className="px-4 py-3">{row.previous_count}</td>
                  <td
                    className={`px-4 py-3 ${
                      row.change_pct > 0
                        ? 'text-green-700'
                        : row.change_pct < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {row.change_pct > 0 ? '+' : ''}
                    {row.change_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {data.other_breakdown?.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-gray-800 mb-1">«Другое» — расшифровка</h2>
          <p className="text-sm text-gray-500 mb-4">Свободные формулировки источника</p>
          <ul className="space-y-2">
            {data.other_breakdown.map((item) => (
              <li key={item.label} className="flex justify-between text-sm border-b border-gray-100 py-2">
                <span>{item.label}</span>
                <span className="text-gray-500">{item.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
