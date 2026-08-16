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

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnalyticsOutcomes() {
  const { apiParams } = useAnalyticsPeriod();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/admin/analytics/outcomes', {
          params: apiParams,
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
  }, [apiParams]);

  if (loading) return <div className="text-center py-16 text-gray-500">Загрузка...</div>;
  if (!data) return <div className="text-center py-16 text-gray-500">Нет данных</div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Отмены и переносы</h2>
        <p className="text-sm text-gray-500 mb-4">
          Статистика по записям, которые отменили или перенесли (удаление по ошибке сюда не
          входит)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Отменено', value: data.cancelled_count },
            { label: 'Доля отмен', value: `${data.cancel_rate}%` },
            { label: 'С переносом', value: data.rescheduled_count },
            { label: 'Доля переносов', value: `${data.reschedule_rate}%` },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Всего переносов за период: {data.total_reschedules}
          {data.rescheduled_count
            ? ` · в среднем ${data.average_reschedules_per_rescheduled} на запись с переносом`
            : ''}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Причины отмен</h2>
        <p className="text-sm text-gray-500 mb-4">Распределение по указанным причинам</p>
        {data.by_reason?.length ? (
          <div className="bg-white rounded-xl border border-gray-100 p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_reason} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, _name, props) => [
                    `${value} (${props.payload.share}%)`,
                    'Отмен',
                  ]}
                />
                <Bar dataKey="count" name="Отмен" fill="#b45353" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-sm text-gray-500">
            Пока нет отменённых записей за выбранный период
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Последние отмены</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Дата записи</th>
                <th className="px-4 py-3 font-medium">Причина</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_cancellations || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Нет отмен
                  </td>
                </tr>
              ) : (
                data.recent_cancellations.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(row.starts_at)}
                    </td>
                    <td className="px-4 py-3">
                      {row.reason_label}
                      {row.reason_other ? ` — ${row.reason_other}` : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatMoney(row.total_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-1">Последние переносы</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Новое время</th>
                <th className="px-4 py-3 font-medium">Переносов</th>
                <th className="px-4 py-3 font-medium">Причина</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_reschedules || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Нет переносов
                  </td>
                </tr>
              ) : (
                data.recent_reschedules.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(row.starts_at)}
                    </td>
                    <td className="px-4 py-3">{row.reschedule_count}</td>
                    <td className="px-4 py-3">{row.last_reschedule_reason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
