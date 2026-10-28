import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { formatMoney } from '../../data/calendarConstants';
import { useExpensePeriod } from '../../hooks/useExpensePeriod';
import ExpenseDonuts from './ExpenseDonuts';

const PERIOD_CHIPS = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'year', label: 'Год' },
  { id: 'custom', label: 'Свой' },
];

const VIEW_MODES = [
  { id: 'people', label: 'Серёжа и Настя' },
  { id: 'combined', label: 'Общее' },
];

const METRICS = [
  { id: 'money', label: 'Цена' },
  { id: 'percent', label: 'Процент' },
];

const INTERVALS = [
  { id: 'weekly', label: 'каждую неделю' },
  { id: 'monthly', label: 'каждый месяц' },
  { id: 'yearly', label: 'каждый год' },
];

function payerLabel(value) {
  return value === 'nastya' ? 'Настя' : 'Серёжа';
}

function formatDayTitle(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
}

function emptyForm(spentOn) {
  return {
    spent_on: spentOn,
    amount: '',
    category_id: '',
    paid_by: 'sereja',
    is_shared: false,
    comment: '',
  };
}

function emptyRecurring(spentOn) {
  return {
    title: '',
    amount: '',
    category_id: '',
    paid_by: 'sereja',
    is_shared: true,
    interval: 'monthly',
    start_date: spentOn,
    end_date: '',
  };
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
        active ? 'bg-[#4a7c59] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function FilterRow({ title, children }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function AdminExpenses() {
  const { period, from, to, setPeriodType, setCustomRange, shift, isSingleDay } =
    useExpensePeriod();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => emptyForm(from));
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringForm, setRecurringForm] = useState(() => emptyRecurring(from));
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [chartMode, setChartMode] = useState('people');
  const [metric, setMetric] = useState('money');

  useEffect(() => {
    setForm((prev) => ({ ...prev, spent_on: prev.spent_on || from }));
  }, [from]);

  const queryParams = useMemo(() => ({ from, to }), [from, to]);

  const loadCategories = async () => {
    const { data } = await api.get('/admin/expenses/categories');
    setCategories(data);
    setForm((prev) => ({
      ...prev,
      category_id: prev.category_id || (data[0] ? String(data[0].id) : ''),
    }));
    setRecurringForm((prev) => ({
      ...prev,
      category_id: prev.category_id || (data[0] ? String(data[0].id) : ''),
    }));
  };

  const loadExpenses = async () => {
    const { data } = await api.get('/admin/expenses', { params: queryParams });
    setItems(data.items);
  };

  const loadRecurring = async () => {
    const { data } = await api.get('/admin/expenses/recurring');
    setRecurring(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [cats, exp, rules] = await Promise.all([
          api.get('/admin/expenses/categories'),
          api.get('/admin/expenses', { params: queryParams }),
          api.get('/admin/expenses/recurring'),
        ]);
        if (cancelled) return;
        setCategories(cats.data);
        setItems(exp.data.items);
        setRecurring(rules.data);
        setForm((prev) => ({
          ...prev,
          category_id: prev.category_id || (cats.data[0] ? String(cats.data[0].id) : ''),
        }));
        setRecurringForm((prev) => ({
          ...prev,
          category_id: prev.category_id || (cats.data[0] ? String(cats.data[0].id) : ''),
        }));
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const groupedItems = useMemo(() => {
    const groups = [];
    const index = {};
    items.forEach((item) => {
      if (!(item.spent_on in index)) {
        index[item.spent_on] = groups.length;
        groups.push({ date: item.spent_on, items: [] });
      }
      groups[index[item.spent_on]].items.push(item);
    });
    return groups;
  }, [items]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.amount || !form.category_id) return;
    setSaving(true);
    try {
      await api.post('/admin/expenses', {
        ...form,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
      });
      setForm((prev) => ({ ...emptyForm(from), category_id: prev.category_id, paid_by: prev.paid_by }));
      setAddOpen(false);
      await loadExpenses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Не удалось сохранить трату');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const { data } = await api.post('/admin/expenses/categories', { name });
      setAddingCategory(false);
      setNewCategory('');
      await loadCategories();
      setForm((prev) => ({ ...prev, category_id: String(data.id) }));
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось добавить категорию');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить трату?')) return;
    try {
      await api.delete(`/admin/expenses/${id}`);
      await loadExpenses();
    } catch (err) {
      alert('Не удалось удалить');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      spent_on: item.spent_on,
      amount: String(item.amount),
      category_id: String(item.category_id),
      paid_by: item.paid_by,
      is_shared: item.is_shared,
      comment: item.comment || '',
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/admin/expenses/${id}`, {
        ...editForm,
        amount: Number(editForm.amount),
        category_id: Number(editForm.category_id),
      });
      setEditingId(null);
      setEditForm(null);
      await loadExpenses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось сохранить');
    }
  };

  const handleCreateRecurring = async (event) => {
    event.preventDefault();
    if (!recurringForm.title || !recurringForm.amount || !recurringForm.category_id) return;
    try {
      await api.post('/admin/expenses/recurring', {
        ...recurringForm,
        amount: Number(recurringForm.amount),
        category_id: Number(recurringForm.category_id),
        end_date: recurringForm.end_date || null,
      });
      setRecurringForm(emptyRecurring(from));
      await Promise.all([loadRecurring(), loadExpenses()]);
    } catch (err) {
      alert(err.response?.data?.detail || 'Не удалось сохранить повтор');
    }
  };

  const toggleRecurring = async (rule) => {
    try {
      await api.patch(`/admin/expenses/recurring/${rule.id}`, { is_active: !rule.is_active });
      await Promise.all([loadRecurring(), loadExpenses()]);
    } catch (err) {
      alert('Не удалось обновить правило');
    }
  };

  const deleteRecurring = async (id) => {
    if (!confirm('Удалить повторяющийся платёж? Уже созданные траты останутся.')) return;
    try {
      await api.delete(`/admin/expenses/recurring/${id}`);
      await loadRecurring();
    } catch (err) {
      alert('Не удалось удалить правило');
    }
  };

  const periodLabel =
    from === to
      ? formatDayTitle(from)
      : `${formatDayTitle(from)} — ${formatDayTitle(to)}`;

  const openAdd = () => {
    setForm((prev) => ({ ...prev, spent_on: from }));
    setAddingCategory(false);
    setAddOpen(true);
  };

  useEffect(() => {
    if (!addOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setAddOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addOpen]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={22} className="text-[#4a7c59]" />
          <h1 className="text-2xl font-serif text-gray-800">Расходы</h1>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="bg-[#4a7c59] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3d6b4a]"
        >
          <Plus size={18} />
          Трата
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 space-y-4">
        <FilterRow title="Кто">
          {VIEW_MODES.map((option) => (
            <FilterChip
              key={option.id}
              active={chartMode === option.id}
              onClick={() => setChartMode(option.id)}
            >
              {option.label}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow title="Сумма">
          {METRICS.map((option) => (
            <FilterChip
              key={option.id}
              active={metric === option.id}
              onClick={() => setMetric(option.id)}
            >
              {option.label}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow title="Разрез">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
            aria-label="Предыдущий период"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-1 self-center text-sm font-medium text-gray-800 capitalize">
            {periodLabel}
          </span>
          <button
            type="button"
            onClick={() => shift(1)}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
            aria-label="Следующий период"
          >
            <ChevronRight size={18} />
          </button>
          {PERIOD_CHIPS.map((chip) => (
            <FilterChip
              key={chip.id}
              active={period === chip.id}
              onClick={() => setPeriodType(chip.id)}
            >
              {chip.label}
            </FilterChip>
          ))}
        </FilterRow>
        {period === 'custom' && (
          <div className="flex flex-wrap gap-2">
            <label className="text-sm text-gray-600">
              С
              <input
                type="date"
                value={from}
                onChange={(e) => setCustomRange(e.target.value, to)}
                className="mt-1 block border border-gray-300 rounded-lg px-3 py-1.5"
              />
            </label>
            <label className="text-sm text-gray-600">
              По
              <input
                type="date"
                value={to}
                onChange={(e) => setCustomRange(from, e.target.value)}
                className="mt-1 block border border-gray-300 rounded-lg px-3 py-1.5"
              />
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Загрузка...</div>
      ) : (
        <ExpenseDonuts items={items} mode={chartMode} metric={metric} />
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть"
            onClick={() => setAddOpen(false)}
          />
          <form
            onSubmit={handleCreate}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Добавить трату</h2>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm text-gray-600">
            Сумма
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-lg"
              placeholder="0"
            />
          </label>
          <label className="text-sm text-gray-600">
            Дата
            <input
              type="date"
              required
              value={form.spent_on}
              onChange={(e) => setForm({ ...form, spent_on: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm text-gray-600 sm:col-span-2">
            Категория
            <div className="mt-1 flex gap-2">
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setAddingCategory((v) => !v)}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                своя
              </button>
            </div>
          </label>
          {addingCategory && (
            <div className="sm:col-span-2 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Название категории"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 rounded-lg bg-[#4a7c59] text-white"
              >
                Добавить
              </button>
            </div>
          )}
          <div className="text-sm text-gray-600">
            Кто платил
            <div className="mt-1 flex gap-2">
              {['sereja', 'nastya'].map((who) => (
                <button
                  key={who}
                  type="button"
                  onClick={() => setForm({ ...form, paid_by: who })}
                  className={`flex-1 px-3 py-2 rounded-lg ${
                    form.paid_by === who
                      ? 'bg-[#4a7c59] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {payerLabel(who)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
            <input
              type="checkbox"
              checked={form.is_shared}
              onChange={(e) => setForm({ ...form, is_shared: e.target.checked })}
              className="w-4 h-4"
            />
            Общая трата
          </label>
          <label className="text-sm text-gray-600 sm:col-span-2">
            Комментарий
            <input
              type="text"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="необязательно"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-3 w-full sm:w-auto bg-[#4a7c59] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#3d6b4a] disabled:opacity-60"
        >
          <Plus size={18} />
          Сохранить
        </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
        <button
          type="button"
          onClick={() => setShowRecurring((v) => !v)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <Repeat size={18} className="text-[#4a7c59]" />
            Повторяющиеся
            <span className="text-gray-400 font-normal">
              {recurring.filter((r) => r.is_active).length} активных
            </span>
          </span>
          {showRecurring ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showRecurring && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            <form onSubmit={handleCreateRecurring} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 sm:col-span-2">
                Название
                <input
                  type="text"
                  required
                  value={recurringForm.title}
                  onChange={(e) => setRecurringForm({ ...recurringForm, title: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Аренда, подписка..."
                />
              </label>
              <label className="text-sm text-gray-600">
                Сумма
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={recurringForm.amount}
                  onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </label>
              <label className="text-sm text-gray-600">
                Интервал
                <select
                  value={recurringForm.interval}
                  onChange={(e) => setRecurringForm({ ...recurringForm, interval: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  {INTERVALS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-600">
                Категория
                <select
                  required
                  value={recurringForm.category_id}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, category_id: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-gray-600">
                Старт
                <input
                  type="date"
                  required
                  value={recurringForm.start_date}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, start_date: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </label>
              <div className="text-sm text-gray-600">
                Кто платит
                <div className="mt-1 flex gap-2">
                  {['sereja', 'nastya'].map((who) => (
                    <button
                      key={who}
                      type="button"
                      onClick={() => setRecurringForm({ ...recurringForm, paid_by: who })}
                      className={`flex-1 px-3 py-2 rounded-lg ${
                        recurringForm.paid_by === who
                          ? 'bg-[#4a7c59] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {payerLabel(who)}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
                <input
                  type="checkbox"
                  checked={recurringForm.is_shared}
                  onChange={(e) =>
                    setRecurringForm({ ...recurringForm, is_shared: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                Общая
              </label>
              <button
                type="submit"
                className="sm:col-span-2 bg-[#4a7c59] text-white px-4 py-2.5 rounded-lg"
              >
                Добавить повтор
              </button>
            </form>

            {recurring.length === 0 && (
              <p className="text-sm text-gray-500">Повторяющихся платежей пока нет</p>
            )}
            <div className="space-y-2">
              {recurring.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-3"
                >
                  <div>
                    <div className="font-medium text-gray-800">{rule.title}</div>
                    <div className="text-sm text-gray-500">
                      {formatMoney(rule.amount)} · {rule.category_name} · {payerLabel(rule.paid_by)}
                      {rule.is_shared ? ' · общая' : ' · личная'} ·{' '}
                      {INTERVALS.find((i) => i.id === rule.interval)?.label}
                    </div>
                    {!rule.is_active && (
                      <div className="text-xs text-amber-600 mt-1">на паузе</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRecurring(rule)}
                      className="text-sm text-[#4a7c59]"
                    >
                      {rule.is_active ? 'Пауза' : 'Вкл'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecurring(rule.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!loading && items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">За этот период трат нет</div>
      ) : (
        <div className="space-y-4">
          {groupedItems.map((group) => (
            <section key={group.date}>
              {!isSingleDay && (
                <h3 className="text-sm font-medium text-gray-500 mb-2 capitalize">
                  {formatDayTitle(group.date)}
                </h3>
              )}
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4"
                  >
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                          />
                          <input
                            type="date"
                            value={editForm.spent_on}
                            onChange={(e) => setEditForm({ ...editForm, spent_on: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                          />
                          <select
                            value={editForm.category_id}
                            onChange={(e) =>
                              setEditForm({ ...editForm, category_id: e.target.value })
                            }
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editForm.paid_by}
                            onChange={(e) => setEditForm({ ...editForm, paid_by: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                          >
                            <option value="sereja">Серёжа</option>
                            <option value="nastya">Настя</option>
                          </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.is_shared}
                            onChange={(e) =>
                              setEditForm({ ...editForm, is_shared: e.target.checked })
                            }
                          />
                          Общая
                        </label>
                        <input
                          type="text"
                          value={editForm.comment}
                          onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="комментарий"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="flex-1 bg-[#4a7c59] text-white rounded-lg py-2"
                          >
                            Сохранить
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 rounded-lg bg-gray-100"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatMoney(item.amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.category_name} · {payerLabel(item.paid_by)}
                            {item.is_shared ? ' · общая' : ' · личная'}
                          </div>
                          {item.comment && (
                            <div className="text-sm text-gray-500 mt-1">{item.comment}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-2 text-gray-500 hover:text-gray-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
