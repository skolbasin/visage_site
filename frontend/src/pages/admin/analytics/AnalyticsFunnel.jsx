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
import { useAnalyticsPeriod } from '../../../hooks/useAnalyticsPeriod';

export default function AnalyticsFunnel() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/funnel', { params: apiParams });
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
        <h2 className="text-lg font-medium text-gray-800 mb-1">Воронка статусов</h2>
        <p className="text-sm text-gray-500 mb-4">
          Конверсия в визит считается среди завершённых исходов (без ещё ожидаемых)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Конверсия в визит</div>
            <div className="text-3xl font-semibold text-[#4a7c59] mt-1">
              {data.conversion_to_visit}%
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Отмены</div>
            <div className="text-3xl font-semibold text-red-600 mt-1">{data.cancel_rate}%</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Не пришли</div>
            <div className="text-3xl font-semibold text-orange-600 mt-1">{data.no_show_rate}%</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.stages} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Записи" fill="#4a7c59" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Итоги воронки</h2>
        <p className="text-sm text-gray-500 mb-4">
          Ожидают: {data.awaiting} · Решено: {data.resolved} · Всего: {data.total}
        </p>
        <div className="space-y-3">
          {data.stages.map((stage) => {
            const pct = data.total ? Math.round((stage.count / data.total) * 100) : 0;
            return (
              <div key={stage.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{stage.label}</span>
                  <span className="text-gray-500">
                    {stage.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4a7c59] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
