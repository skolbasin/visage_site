import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Pencil,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../services/api';

const OWNERS = [
  { id: 'sereja', title: 'Планы Сережи' },
  { id: 'nastya', title: 'Планы Насти' },
];
const QUARTERS = [
  { id: 1, title: 'I квартал' },
  { id: 2, title: 'II квартал' },
  { id: 3, title: 'III квартал' },
  { id: 4, title: 'IV квартал' },
];

function emptyForm() {
  return {
    title: '',
    description: '',
    progress_type: 'checkbox',
    target_value: '',
    current_value: '0',
    unit: '',
  };
}

function PlanForm({ item, context, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => item ? {
    title: item.title,
    description: item.description || '',
    progress_type: item.progress_type,
    target_value: item.target_value ?? '',
    current_value: item.current_value ?? '0',
    unit: item.unit || '',
  } : emptyForm());

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSave({
      title: form.title.trim(),
      description: form.description.trim() || null,
      progress_type: form.progress_type,
      target_value: form.progress_type === 'metric' ? Number(form.target_value) : null,
      current_value: form.progress_type === 'metric' ? Number(form.current_value || 0) : null,
      unit: form.progress_type === 'metric' ? (form.unit.trim() || null) : null,
    });
  };

  const periodTitle = context.period_type === 'year'
    ? 'на год'
    : `на ${QUARTERS.find((quarter) => quarter.id === context.quarter)?.title}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {item ? 'Редактировать план' : `Добавить план ${periodTitle}`}
            </h2>
            {!item && <p className="mt-1 text-sm text-gray-500">{context.ownerTitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <label className="mb-4 block text-sm font-medium text-gray-700">
          Задача
          <input
            required
            maxLength={300}
            autoFocus
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#4a7c59]"
            placeholder="Например, накопить на отпуск"
          />
        </label>
        <label className="mb-4 block text-sm font-medium text-gray-700">
          Заметка
          <textarea
            maxLength={5000}
            rows={2}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#4a7c59]"
            placeholder="Необязательно"
          />
        </label>
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-medium text-gray-700">Как отмечать выполнение</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'checkbox', label: 'Выполнено / нет' },
              { id: 'metric', label: 'Шкала прогресса' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                disabled={Boolean(item)}
                onClick={() => update('progress_type', type.id)}
                className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  form.progress_type === type.id
                    ? 'border-[#4a7c59] bg-green-50 font-medium text-[#315d3d]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </fieldset>
        {form.progress_type === 'metric' && (
          <div className="mb-5 grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-gray-700">
              Цель
              <input
                required
                type="number"
                min="0.001"
                step="any"
                value={form.target_value}
                onChange={(event) => update('target_value', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#4a7c59]"
                placeholder="100"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Уже сделано
              <input
                type="number"
                min="0"
                step="any"
                value={form.current_value}
                onChange={(event) => update('current_value', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#4a7c59]"
                placeholder="0"
              />
            </label>
            <label className="col-span-2 text-sm font-medium text-gray-700">
              Единица измерения
              <input
                maxLength={40}
                value={form.unit}
                onChange={(event) => update('unit', event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#4a7c59]"
                placeholder="рублей, кг, книг..."
              />
            </label>
          </div>
        )}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving || !form.title.trim() || (form.progress_type === 'metric' && !(Number(form.target_value) > 0))}
            className="rounded-lg bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d684a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PlanRow({ item, progressDraft, onProgressChange, onToggle, onSaveProgress, onEdit, onDelete }) {
  const percent = item.progress_type === 'metric'
    ? Math.min(100, (Number(item.current_value) / Number(item.target_value)) * 100)
    : 0;

  return (
    <li className="group border-b border-dashed border-[#d9d4c8] py-3 last:border-b-0">
      <div className="flex items-start gap-2.5">
        {item.progress_type === 'checkbox' ? (
          <button
            type="button"
            aria-label={item.is_done ? 'Снять отметку выполнения' : 'Отметить выполненным'}
            onClick={() => onToggle(item)}
            className={`mt-0.5 shrink-0 rounded-full ${item.is_done ? 'text-[#4a7c59]' : 'text-[#a8a397] hover:text-[#4a7c59]'}`}
          >
            {item.is_done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
        ) : (
          <span className={`mt-0.5 shrink-0 ${item.is_done ? 'text-[#4a7c59]' : 'text-[#a8a397]'}`}>
            {item.is_done ? <CheckCircle2 size={20} /> : <Target size={19} />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-[15px] leading-6 ${item.is_done ? 'text-gray-400 line-through' : 'text-[#36372f]'}`}>
            {item.title}
          </p>
          {item.description && (
            <p className="mt-0.5 whitespace-pre-wrap text-xs leading-5 text-gray-500">{item.description}</p>
          )}
          {item.progress_type === 'metric' && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-[#e8e4da]">
                <div className="h-full rounded-full bg-[#6f9475] transition-all" style={{ width: `${percent}%` }} />
              </div>
              <span className="min-w-fit text-xs tabular-nums text-gray-600">
                {item.current_value} / {item.target_value}{item.unit ? ` ${item.unit}` : ''}
              </span>
              <input
                aria-label={`Прогресс: ${item.title}`}
                type="number"
                min="0"
                step="any"
                value={progressDraft ?? ''}
                onChange={(event) => onProgressChange(item.id, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSaveProgress(item);
                }}
                className="w-20 rounded border border-[#d9d4c8] bg-white/80 px-2 py-1 text-xs outline-none focus:border-[#4a7c59]"
              />
              <button type="button" onClick={() => onSaveProgress(item)} className="text-xs font-medium text-[#3d684a] hover:underline">
                Обновить
              </button>
            </div>
          )}
        </div>
        <div className="flex shrink-0 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Редактировать: ${item.title}`}
            onClick={() => onEdit(item)}
            className="rounded p-1.5 text-gray-400 hover:bg-white hover:text-gray-700"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            aria-label={`Удалить: ${item.title}`}
            onClick={() => onDelete(item)}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </li>
  );
}

function AddPlanMenu({ owner, onAdd }) {
  const [open, setOpen] = useState(false);
  const [quarterOpen, setQuarterOpen] = useState(false);

  const close = () => {
    setOpen(false);
    setQuarterOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Добавить план: ${owner}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6d1c4] bg-[#fffdf8] text-[#4a7c59] shadow-sm transition hover:border-[#4a7c59] hover:bg-green-50"
      >
        {open ? <X size={18} /> : <Plus size={19} />}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => { close(); onAdd({ owner, period_type: 'year' }); }}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50"
          >
            Добавить план на год
          </button>
          <button
            type="button"
            onClick={() => setQuarterOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-green-50"
          >
            Добавить квартальный план
            <ChevronDown size={15} className={`transition-transform ${quarterOpen ? 'rotate-180' : ''}`} />
          </button>
          {quarterOpen && (
            <div className="ml-2 border-l border-gray-100 pl-2">
              {QUARTERS.map((quarter) => (
                <button
                  type="button"
                  key={quarter.id}
                  onClick={() => { close(); onAdd({ owner, period_type: 'quarter', quarter: quarter.id }); }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-green-50"
                >
                  {quarter.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanSheet({
  owner,
  year,
  plans,
  loading,
  progressDrafts,
  onAdd,
  onProgressChange,
  onToggle,
  onSaveProgress,
  onEdit,
  onDelete,
}) {
  const yearly = plans.yearly;
  const quarterly = plans.quarterly;
  const total = yearly.length + Object.values(quarterly).reduce((sum, items) => sum + items.length, 0);
  const completed = [...yearly, ...Object.values(quarterly).flat()].filter((item) => item.is_done).length;

  const renderRows = (items) => items.map((item) => (
    <PlanRow
      key={item.id}
      item={item}
      progressDraft={progressDrafts[item.id]}
      onProgressChange={onProgressChange}
      onToggle={onToggle}
      onSaveProgress={onSaveProgress}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ));

  return (
    <div className="flex min-w-0 items-start gap-2 sm:gap-3">
      <article className="min-h-[620px] min-w-0 flex-1 overflow-visible rounded-sm border border-[#e5e0d4] bg-[#fffdf8] shadow-[0_8px_24px_rgba(74,61,40,0.10)]">
        <header className="border-b border-[#e5e0d4] px-4 py-5 sm:px-7">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl text-[#34372f] sm:text-2xl">{owner.title}</h2>
            <span className="font-serif text-lg text-[#8b887c]">{year}</span>
          </div>
          <p className="mt-1 text-xs text-[#8b887c]">
            {loading ? 'Загрузка планов...' : total ? `Выполнено ${completed} из ${total}` : 'Планы на год'}
          </p>
          {total > 0 && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e8e4da]">
              <div className="h-full rounded-full bg-[#6f9475] transition-all" style={{ width: `${(completed / total) * 100}%` }} />
            </div>
          )}
        </header>

        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">Загружаем...</div>
        ) : (
          <div className="px-4 py-2 sm:px-7">
            {yearly.length > 0 ? (
              <ul>{renderRows(yearly)}</ul>
            ) : (
              <p className="py-5 text-sm italic text-[#9a9689]">Годовые планы можно добавить кнопкой +</p>
            )}

            {QUARTERS.map((quarter) => {
              const items = quarterly[quarter.id] || [];
              if (!items.length) return null;
              return (
                <section key={quarter.id} className="ml-2 mt-4 border-l-2 border-dotted border-[#c7d3c4] pl-3 sm:ml-4 sm:pl-4">
                  <h3 className="mb-1 font-serif text-base text-[#52735a]">{quarter.title}</h3>
                  <ul>{renderRows(items)}</ul>
                </section>
              );
            })}
          </div>
        )}
      </article>
      <div className="sticky top-6 mt-4">
        <AddPlanMenu owner={owner.id} onAdd={onAdd} />
      </div>
    </div>
  );
}

function emptyPlans() {
  return {
    yearly: [],
    quarterly: { 1: [], 2: [], 3: [], 4: [] },
  };
}

function makeQuery(owner, periodType, year, quarter) {
  return {
    owner,
    period_type: periodType,
    year,
    ...(quarter ? { quarter } : {}),
  };
}

export default function AdminPlans() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [plansByOwner, setPlansByOwner] = useState(() => ({
    sereja: emptyPlans(),
    nastya: emptyPlans(),
  }));
  const [progressDrafts, setProgressDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const requests = OWNERS.flatMap((owner) => [
        api.get('/admin/plans', { params: makeQuery(owner.id, 'year', year) }),
        ...QUARTERS.map((quarter) => api.get('/admin/plans', {
          params: makeQuery(owner.id, 'quarter', year, quarter.id),
        })),
      ]);
      const responses = await Promise.all(requests);
      const nextPlans = {};
      const nextDrafts = {};
      OWNERS.forEach((owner, ownerIndex) => {
        const offset = ownerIndex * 5;
        const yearly = responses[offset].data;
        const quarterly = {};
        QUARTERS.forEach((quarter, quarterIndex) => {
          quarterly[quarter.id] = responses[offset + quarterIndex + 1].data;
        });
        nextPlans[owner.id] = { yearly, quarterly };
        [...yearly, ...Object.values(quarterly).flat()].forEach((item) => {
          nextDrafts[item.id] = String(item.current_value ?? 0);
        });
      });
      setPlansByOwner(nextPlans);
      setProgressDrafts(nextDrafts);
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось загрузить планы. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const openNewPlan = (context) => {
    const owner = OWNERS.find((person) => person.id === context.owner);
    setModal({ ...context, ownerTitle: owner.title, item: null });
  };

  const openEditPlan = (item) => {
    const owner = OWNERS.find((person) => person.id === item.owner);
    setModal({
      owner: item.owner,
      ownerTitle: owner.title,
      period_type: item.period_type,
      quarter: item.quarter,
      item,
    });
  };

  const saveItem = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (modal.item) {
        await api.patch(`/admin/plans/${modal.item.id}`, payload);
      } else {
        await api.post('/admin/plans', {
          ...makeQuery(modal.owner, modal.period_type, year, modal.quarter),
          ...payload,
        });
      }
      setModal(null);
      await loadPlans();
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось сохранить план. Проверьте данные и повторите попытку.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = async (item) => {
    setError('');
    try {
      await api.patch(`/admin/plans/${item.id}`, { is_done: !item.is_done });
      await loadPlans();
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось обновить выполнение плана.');
    }
  };

  const saveProgress = async (item) => {
    const value = Number(progressDrafts[item.id]);
    if (!Number.isFinite(value) || value < 0) {
      setError('Прогресс должен быть неотрицательным числом.');
      return;
    }
    setError('');
    try {
      await api.patch(`/admin/plans/${item.id}`, { current_value: value });
      await loadPlans();
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось сохранить прогресс.');
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Удалить план «${item.title}»?`)) return;
    setError('');
    try {
      await api.delete(`/admin/plans/${item.id}`);
      await loadPlans();
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось удалить план.');
    }
  };

  return (
    <div className="min-h-full bg-[#f3f1eb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="font-serif text-2xl text-gray-900 sm:text-3xl">Наши планы</h1>
            <p className="mt-1 text-sm text-gray-500">Два листа — один общий год</p>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[#e5e0d4] bg-[#fffdf8] px-3 py-1.5 shadow-sm">
            <button
              type="button"
              aria-label="Предыдущий год"
              disabled={year <= 2000}
              onClick={() => setYear((value) => value - 1)}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="min-w-16 text-center font-serif text-2xl tabular-nums text-[#34372f]">{year}</span>
            <button
              type="button"
              aria-label="Следующий год"
              disabled={year >= 2200}
              onClick={() => setYear((value) => value + 1)}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button type="button" onClick={() => setError('')} aria-label="Закрыть сообщение"><X size={17} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-7">
          {OWNERS.map((owner) => (
            <PlanSheet
              key={owner.id}
              owner={owner}
              year={year}
              plans={plansByOwner[owner.id]}
              loading={loading}
              progressDrafts={progressDrafts}
              onAdd={openNewPlan}
              onProgressChange={(id, value) => {
                setProgressDrafts((drafts) => ({ ...drafts, [id]: value }));
              }}
              onToggle={toggleDone}
              onSaveProgress={saveProgress}
              onEdit={openEditPlan}
              onDelete={deleteItem}
            />
          ))}
        </div>
      </div>
      {modal && (
        <PlanForm
          key={modal.item?.id || `${modal.owner}-${modal.period_type}-${modal.quarter || 'year'}`}
          item={modal.item}
          context={modal}
          saving={saving}
          onClose={() => { if (!saving) setModal(null); }}
          onSave={saveItem}
        />
      )}
    </div>
  );
}
