import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react';
import api from '../../../services/api';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const SOURCES = [
  { id: 'profi_ru', title: 'Профи Ру', description: 'Расходы на заявки и подписку' },
  { id: 'instagram', title: 'Instagram', description: 'Подписчики, Reels и инициативы' },
  { id: 'pinterest', title: 'Pinterest', description: 'Просмотры и опубликованные пины' },
];

function blankMetrics(source) {
  if (source === 'profi_ru') {
    return { ad_spend: '0', subscription_cost: '0', subscription_active: false };
  }
  if (source === 'instagram') {
    return { followers_count: '0', reels_count: '0', initiatives: '' };
  }
  return { views_count: '0', pins_count: '0' };
}

function formatNumber(value) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value || 0);
}

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function MetricInput({ label, value, onChange, min = 0, step = '1', suffix }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <div className="mt-1.5 flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-[#4a7c59]">
        <input
          required
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-lg px-3 py-2.5 outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
}

function MetricsForm({ source, month, item, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...blankMetrics(source.id),
    ...(item || {}),
    ad_spend: String(item?.ad_spend ?? 0),
    subscription_cost: String(item?.subscription_cost ?? 0),
    followers_count: String(item?.followers_count ?? 0),
    reels_count: String(item?.reels_count ?? 0),
    views_count: String(item?.views_count ?? 0),
    pins_count: String(item?.pins_count ?? 0),
    initiatives: item?.initiatives ?? '',
    subscription_active: item?.subscription_active ?? false,
  }));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const number = (key) => Number(form[key]);
    if (source.id === 'profi_ru') {
      onSave({
        ad_spend: number('ad_spend'),
        subscription_cost: number('subscription_cost'),
        subscription_active: form.subscription_active,
      });
    } else if (source.id === 'instagram') {
      onSave({
        followers_count: number('followers_count'),
        reels_count: number('reels_count'),
        initiatives: form.initiatives.trim(),
      });
    } else {
      onSave({ views_count: number('views_count'), pins_count: number('pins_count') });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{source.title} · {MONTHS[month - 1]}</h2>
            <p className="mt-1 text-sm text-gray-500">Показатели за месяц</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {source.id === 'profi_ru' && (
          <div className="space-y-4">
            <MetricInput
              label="Потрачено на заявки"
              step="0.01"
              suffix="₽"
              value={form.ad_spend}
              onChange={(value) => update('ad_spend', value)}
            />
            <MetricInput
              label="Стоимость подписки"
              step="0.01"
              suffix="₽"
              value={form.subscription_cost}
              onChange={(value) => update('subscription_cost', value)}
            />
            <label className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.subscription_active}
                onChange={(event) => update('subscription_active', event.target.checked)}
                className="h-4 w-4 accent-[#4a7c59]"
              />
              Подписка была включена в этом месяце
            </label>
          </div>
        )}

        {source.id === 'instagram' && (
          <div className="space-y-4">
            <MetricInput
              label="Подписчики на конец месяца"
              value={form.followers_count}
              onChange={(value) => update('followers_count', value)}
            />
            <MetricInput
              label="Опубликовано Reels"
              value={form.reels_count}
              onChange={(value) => update('reels_count', value)}
            />
            <label className="block text-sm font-medium text-gray-700">
              Дополнительные инициативы
              <textarea
                rows={4}
                maxLength={10000}
                value={form.initiatives}
                onChange={(event) => update('initiatives', event.target.value)}
                className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#4a7c59]"
                placeholder="Коллаборации, рекламные размещения и другие активности"
              />
            </label>
          </div>
        )}

        {source.id === 'pinterest' && (
          <div className="space-y-4">
            <MetricInput
              label="Просмотры за месяц"
              value={form.views_count}
              onChange={(value) => update('views_count', value)}
            />
            <MetricInput
              label="Опубликовано пинов"
              value={form.pins_count}
              onChange={(value) => update('pins_count', value)}
            />
          </div>
        )}

        <p className="mt-4 rounded-lg bg-[#f7f8f6] px-3 py-2 text-xs text-gray-500">
          Количество заявок за месяц автоматически берётся из календаря и аналитики.
        </p>
        <div className="mt-5 flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d684a] disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}

function sourceSummary(source, months) {
  const applications = months.reduce((sum, item) => sum + item.applications, 0);
  if (source.id === 'profi_ru') {
    const spent = months.reduce((sum, item) => sum + Number(item.ad_spend || 0), 0);
    const subscription = months.reduce((sum, item) => sum + Number(item.subscription_cost || 0), 0);
    return `${applications} заявок · заявки ${formatMoney(spent)} · подписка ${formatMoney(subscription)}`;
  }
  if (source.id === 'instagram') {
    const reels = months.reduce((sum, item) => sum + Number(item.reels_count || 0), 0);
    const latest = [...months].reverse().find((item) => item.followers_count !== null);
    return `${applications} заявок · ${reels} Reels${latest ? ` · ${formatNumber(latest.followers_count)} подписчиков` : ''}`;
  }
  const views = months.reduce((sum, item) => sum + Number(item.views_count || 0), 0);
  const pins = months.reduce((sum, item) => sum + Number(item.pins_count || 0), 0);
  return `${applications} заявок · ${formatNumber(views)} просмотров · ${formatNumber(pins)} пинов`;
}

function monthDetails(source, item) {
  if (source.id === 'profi_ru') {
    if (item.ad_spend == null) return 'Нет данных';
    return `${formatMoney(item.ad_spend)} на заявки · подписка ${item.subscription_active ? 'включена' : 'выключена'} (${formatMoney(item.subscription_cost)})`;
  }
  if (source.id === 'instagram') {
    if (item.followers_count == null) return 'Нет данных';
    const growth = item.follower_growth_pct == null
      ? 'нет предыдущего периода'
      : `${item.follower_growth_pct > 0 ? '+' : ''}${item.follower_growth_pct}% к прошлому месяцу`;
    return `${formatNumber(item.followers_count)} подписчиков · ${growth} · Reels: ${item.reels_count}`;
  }
  if (item.views_count == null) return 'Нет данных';
  return `${formatNumber(item.views_count)} просмотров · ${formatNumber(item.pins_count)} пинов`;
}

export default function TrafficSources() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [sources, setSources] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/admin/marketing/traffic-sources/${year}`);
      setSources(data.sources);
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось загрузить показатели источников трафика.');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const monthsBySource = useMemo(() => sources, [sources]);

  const saveMetrics = async (values) => {
    setSaving(true);
    setError('');
    try {
      await api.put(
        `/admin/marketing/traffic-sources/${editing.source.id}/${year}/${editing.month}`,
        values,
      );
      setEditing(null);
      await loadMetrics();
    } catch (requestError) {
      console.error(requestError);
      setError(requestError.response?.data?.detail || 'Не удалось сохранить показатели.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-serif text-gray-900">Источники трафика</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ежемесячно фиксируйте расходы, активность и обращения из каждого канала.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-gray-100 bg-white px-2 py-1 shadow-sm sm:self-auto">
          <button
            type="button"
            aria-label="Предыдущий год"
            disabled={year <= 2000}
            onClick={() => setYear((value) => value - 1)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft size={19} />
          </button>
          <span className="min-w-14 text-center font-serif text-xl tabular-nums text-gray-800">{year}</span>
          <button
            type="button"
            aria-label="Следующий год"
            disabled={year >= 2200}
            onClick={() => setYear((value) => value + 1)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Закрыть сообщение"><X size={17} /></button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">Загружаем показатели...</div>
      ) : (
        <div className="space-y-5">
          {SOURCES.map((source) => {
            const months = monthsBySource[source.id] || [];
            return (
              <section key={source.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <header className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{source.title}</h3>
                    <p className="text-xs text-gray-500">{source.description}</p>
                  </div>
                  <p className="text-sm text-gray-700">{sourceSummary(source, months)}</p>
                </header>
                <div className="divide-y divide-gray-100">
                  {months.map((item) => (
                    <div key={item.month} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-24 shrink-0 text-sm font-medium text-gray-800">{MONTHS[item.month - 1]}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600">{monthDetails(source, item)}</p>
                          {source.id === 'instagram' && item.initiatives && (
                            <p className="mt-1 whitespace-pre-line text-xs text-gray-500">{item.initiatives}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                        <span className="text-xs text-gray-500">
                          Заявки: <strong className="font-medium text-gray-800">{item.applications}</strong>
                        </span>
                        <button
                          type="button"
                          aria-label={`${item.ad_spend == null && item.followers_count == null && item.views_count == null ? 'Заполнить' : 'Изменить'}: ${source.title}, ${MONTHS[item.month - 1]}`}
                          onClick={() => setEditing({ source, month: item.month, item })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-[#4a7c59] hover:text-[#4a7c59]"
                        >
                          <Pencil size={13} />
                          {item.ad_spend == null && item.followers_count == null && item.views_count == null ? 'Заполнить' : 'Изменить'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {editing && (
        <MetricsForm
          key={`${editing.source.id}-${year}-${editing.month}`}
          source={editing.source}
          month={editing.month}
          item={editing.item}
          saving={saving}
          onClose={() => { if (!saving) setEditing(null); }}
          onSave={saveMetrics}
        />
      )}
    </div>
  );
}
