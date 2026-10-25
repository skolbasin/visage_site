import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useAnalyticsPeriod } from '../../hooks/useAnalyticsPeriod';

const TABS = [
  { to: 'overview', label: 'Сводка' },
  { to: 'sources', label: 'Источники' },
  { to: 'funnel', label: 'Воронка' },
  { to: 'outcomes', label: 'Отмены' },
  { to: 'quality', label: 'Качество' },
  { to: 'revenue', label: 'Выручка' },
  { to: 'services', label: 'Услуги' },
  { to: 'groups', label: 'Группы' },
];

const PRESETS = [
  { id: 'week', label: '+ неделя' },
  { id: 'month', label: '+ месяц' },
  { id: 'quarter', label: '+ квартал' },
  { id: 'year', label: '+ год' },
];

export default function AdminAnalyticsLayout() {
  const { from, to, setPeriod, applyPreset } = useAnalyticsPeriod();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={22} className="text-[#4a7c59]" />
          <h1 className="text-2xl font-serif text-gray-800">Аналитика</h1>
        </div>
        <p className="text-sm text-gray-500">
          Метрики по записям календаря: трафик, конверсия, выручка
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-sm text-gray-600">
              С
              <input
                type="date"
                value={from}
                onChange={(e) => setPeriod(e.target.value, to)}
                className="mt-1 block border border-gray-300 rounded-lg px-3 py-1.5"
              />
            </label>
            <label className="text-sm text-gray-600">
              По
              <input
                type="date"
                value={to}
                onChange={(e) => setPeriod(from, e.target.value)}
                className="mt-1 block border border-gray-300 rounded-lg px-3 py-1.5"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                title="Конец периода считается от даты «С»"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6 -mx-1 px-1">
        <nav className="flex gap-1 min-w-max border-b border-gray-200">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={`/admin/analytics/${tab.to}?from=${from}&to=${to}`}
              className={({ isActive }) =>
                `px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-[#4a7c59] text-[#4a7c59] font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
