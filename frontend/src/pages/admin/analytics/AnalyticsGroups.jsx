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

export default function AnalyticsGroups() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/groups', { params: apiParams });
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
        <h2 className="text-lg font-medium text-gray-800 mb-1">Наполненность записей</h2>
        <p className="text-sm text-gray-500 mb-4">
          Соло vs групповые записи (когда в одну запись добавлены ещё люди)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Групповые записи', value: data.group_count },
            { label: 'Доля групповых', value: `${data.group_share}%` },
            {
              label: 'Людей в среднем',
              value: data.average_people_per_appointment,
            },
            {
              label: 'В группах в среднем',
              value: data.average_people_in_groups,
            },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Размер записи</h2>
        <p className="text-sm text-gray-500 mb-4">Сколько человек обычно в одной записи</p>
        <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
          {data.size_distribution?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.size_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="people"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'чел.', position: 'insideBottom', offset: -2 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Записи" fill="#4a7c59" radius={[4, 4, 0, 0]} />
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
        <h2 className="text-lg font-medium text-gray-800 mb-1">Выручка: соло vs группы</h2>
        <p className="text-sm text-gray-500 mb-4">Только завершённые записи</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Соло</div>
            <div className="text-2xl font-semibold mt-1">{formatMoney(data.solo_revenue)}</div>
            <div className="text-xs text-gray-400 mt-1">
              Ср. чек: {formatMoney(data.average_solo_check)} · {data.solo_count} записей
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-sm text-gray-500">Группы</div>
            <div className="text-2xl font-semibold mt-1">{formatMoney(data.group_revenue)}</div>
            <div className="text-xs text-gray-400 mt-1">
              Ср. чек: {formatMoney(data.average_group_check)} · {data.group_count} записей
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
