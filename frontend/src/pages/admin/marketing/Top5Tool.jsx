import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import {
  currentMondayIso,
  formatWeekChip,
  formatWeekTitle,
  normalizeMonday,
  shiftMonday,
} from './top5Dates';

const TOP5_API = '/admin/marketing/top5';

function errorText(err, fallback) {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

function weeksInARow(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} неделя подряд`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} недели подряд`;
  return `${count} недель подряд`;
}

function missedWeeks(history, todayMonday) {
  const started = history.find((week) => week.total > 0);
  if (!started) return [];
  return history.filter(
    (week) => week.week_start >= started.week_start && week.week_start < todayMonday && week.total === 0,
  );
}

function streakCount(history, todayMonday) {
  const upToToday = history.filter((week) => week.week_start <= todayMonday);
  let index = upToToday.length - 1;
  if (index >= 0 && upToToday[index].week_start === todayMonday && upToToday[index].total === 0) {
    index -= 1;
  }
  let count = 0;
  while (index >= 0 && upToToday[index].total > 0) {
    count += 1;
    index -= 1;
  }
  return count;
}

function TaskRow({ task, isFirst, isLast, disabled, onToggle, onMove, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [owner, setOwner] = useState(task.owner || '');

  const save = () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    onSave(task, {
      title: nextTitle,
      owner: owner.trim(),
    });
    setEditing(false);
  };

  return (
    <li className="py-3 border-b border-[#e7e1d4] last:border-0">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.is_done}
          disabled={disabled}
          onChange={() => onToggle(task)}
          className="mt-1 h-4 w-4 accent-[#4a7c59]"
          aria-label={task.is_done ? 'Вернуть задачу в план' : 'Отметить задачу сделанной'}
        />
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={300}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
              <input
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                maxLength={80}
                placeholder="Кто"
                className="sm:w-40 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  className="text-sm px-3 py-1 rounded-lg bg-[#4a7c59] text-white"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-sm px-3 py-1 rounded-lg text-gray-600 hover:bg-white"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`text-left text-sm ${
                  task.is_done ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {task.title}
              </button>
              {task.owner && <div className="mt-1 text-xs text-gray-500">{task.owner}</div>}
            </>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={disabled || isFirst}
              onClick={() => onMove(task, task.position - 1)}
              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
              aria-label="Выше"
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              disabled={disabled || isLast}
              onClick={() => onMove(task, task.position + 1)}
              className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-30"
              aria-label="Ниже"
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onDelete(task)}
              className="p-1 rounded text-gray-400 hover:text-red-600"
              aria-label="Удалить задачу"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function Top5Tool() {
  const [params, setParams] = useSearchParams();
  const week = normalizeMonday(params.get('week'));
  const todayMonday = currentMondayIso();
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');

  const openWeek = (iso) => {
    if (iso === week) return;
    setLoading(true);
    setParams({ week: iso }, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [weekRes, historyRes] = await Promise.all([
        api.get(TOP5_API, { params: { week } }),
        api.get(`${TOP5_API}/history`, { params: { weeks: 12, anchor: todayMonday } }),
      ]);
      setPlan(weekRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error(err);
      setError(errorText(err, 'Не удалось загрузить Топ-5'));
    } finally {
      setLoading(false);
    }
  }, [todayMonday, week]);

  useEffect(() => {
    load();
  }, [load]);

  const applyWeek = (data) => {
    setPlan(data);
    setHistory((current) =>
      current.map((item) =>
        item.week_start === data.week_start ? { ...item, total: data.total, done: data.done } : item,
      ),
    );
  };

  const runChange = async (request, fallback) => {
    setSaving(true);
    setError('');
    try {
      const { data } = await request();
      applyWeek(data);
      return true;
    } catch (err) {
      console.error(err);
      setError(errorText(err, fallback));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addTask = async (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || saving) return;
    const saved = await runChange(
      () =>
        api.post(`${TOP5_API}/tasks`, {
          week,
          title: nextTitle,
          owner: owner.trim() || null,
        }),
      'Не удалось добавить задачу',
    );
    if (!saved) return;
    setTitle('');
    setOwner('');
  };

  const current = plan?.week_start === week ? plan : null;
  const tasks = current?.tasks || [];
  const total = current?.total || 0;
  const done = current?.done || 0;
  const maxTasks = current?.max_tasks || 5;
  const atLimit = total >= maxTasks;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const gaps = missedWeeks(history, todayMonday);
  const streak = streakCount(history, todayMonday);

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-gray-500 mb-4">
        Пять дел на неделю, одним списком. День внутри недели не задаётся: составьте список и вычёркивайте сделанное.
      </p>

      <div className="overflow-x-auto mb-4 -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {history.map((item) => {
            const active = item.week_start === week;
            const emptyPast = item.total === 0 && item.week_start < todayMonday;
            return (
              <button
                key={item.week_start}
                type="button"
                onClick={() => openWeek(item.week_start)}
                className={`px-3 py-2 rounded-lg text-left text-xs border transition ${
                  active
                    ? 'border-[#4a7c59] bg-[#eef5f0] text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div>{formatWeekChip(item.week_start)}</div>
                <div className={emptyPast ? 'text-amber-700' : 'text-gray-400'}>
                  {item.total ? `${item.done}/${item.total}` : 'нет плана'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#f4f0e6] border border-[#e4dcc8] rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openWeek(shiftMonday(week, -1))}
              className="p-1.5 rounded-lg bg-white/80 text-gray-600 hover:bg-white"
              aria-label="Предыдущая неделя"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => openWeek(shiftMonday(week, 1))}
              className="p-1.5 rounded-lg bg-white/80 text-gray-600 hover:bg-white"
              aria-label="Следующая неделя"
            >
              <ChevronRight size={18} />
            </button>
            {week !== todayMonday && (
              <button
                type="button"
                onClick={() => openWeek(todayMonday)}
                className="text-sm text-[#4a7c59] px-2"
              >
                Эта неделя
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {total ? `${done} из ${total}` : 'Пусто'}
            {streak > 0 && <span className="text-gray-400"> · {weeksInARow(streak)}</span>}
          </div>
        </div>

        <div className="text-xs tracking-wide uppercase text-[#6b5b3e]">Топ-5</div>
        <h2 className="text-2xl font-serif text-gray-900 mt-1">{formatWeekTitle(week)}</h2>

        <div className="h-1.5 bg-[#e7e1d4] rounded-full overflow-hidden mt-4 mb-4">
          <div className="h-full bg-[#4a7c59] transition-all" style={{ width: `${progress}%` }} />
        </div>

        {gaps.length > 0 && (
          <p className="text-sm text-amber-800 mb-3">
            Без плана: {gaps.slice(0, 3).map((item) => formatWeekChip(item.week_start)).join(', ')}
            {gaps.length > 3 ? ` и ещё ${gaps.length - 3}` : ''}. Неделю лучше не пропускать.
          </p>
        )}

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {loading && !current ? (
          <p className="text-sm text-gray-500 py-8 text-center">Загрузка...</p>
        ) : (
          <>
            {tasks.length === 0 && (
              <p className="text-sm text-gray-600 mb-3">
                {week === todayMonday
                  ? 'На эту неделю список ещё не составлен.'
                  : 'На эту неделю списка нет.'}
              </p>
            )}
            {total > 0 && done === total && (
              <p className="text-sm text-[#3d6b4a] mb-3">Всё, что было в плане на эту неделю, закрыто.</p>
            )}

            <ul>
              {tasks.map((task, index) => (
                <TaskRow
                  key={`${task.id}:${task.title}:${task.owner || ''}`}
                  task={task}
                  isFirst={index === 0}
                  isLast={index === tasks.length - 1}
                  disabled={saving}
                  onToggle={(item) =>
                    runChange(
                      () => api.patch(`${TOP5_API}/tasks/${item.id}`, { is_done: !item.is_done }),
                      'Не удалось обновить задачу',
                    )
                  }
                  onMove={(item, position) =>
                    runChange(
                      () => api.patch(`${TOP5_API}/tasks/${item.id}`, { position }),
                      'Не удалось переставить задачу',
                    )
                  }
                  onDelete={(item) => {
                    if (!window.confirm('Убрать задачу из Топ-5?')) return;
                    runChange(
                      () => api.delete(`${TOP5_API}/tasks/${item.id}`),
                      'Не удалось удалить задачу',
                    );
                  }}
                  onSave={(item, changes) =>
                    runChange(
                      () => api.patch(`${TOP5_API}/tasks/${item.id}`, changes),
                      'Не удалось сохранить задачу',
                    )
                  }
                />
              ))}
            </ul>

            {atLimit ? (
              <p className="text-sm text-gray-600 mt-4">
                В списке уже пять дел. Новое добавится, когда какое-то из них будет убрано.
              </p>
            ) : (
              <form onSubmit={addTask} className="mt-4 space-y-2">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={300}
                  placeholder="Самая важная задача недели"
                  className="w-full border border-[#e4dcc8] rounded-lg px-3 py-2 text-sm bg-white"
                />
                <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                  <input
                    value={owner}
                    onChange={(event) => setOwner(event.target.value)}
                    maxLength={80}
                    placeholder="Кто делает"
                    className="lg:w-44 border border-[#e4dcc8] rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <button
                    type="submit"
                    disabled={saving || !title.trim()}
                    className="lg:ml-auto bg-[#4a7c59] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    Добавить
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
