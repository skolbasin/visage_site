import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import { QuarterPlan } from './QuarterPlan';
import {
  currentQuarterIso,
  isOpeningWeek,
  monthLabel,
  normalizeQuarter,
  quarterChip,
  quarterLabel,
  quarterRange,
  shiftQuarter,
} from './quarterDates';

const QUARTER_API = '/admin/marketing/quarters';

function errorText(err, fallback) {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}

function presentQuarter(data) {
  return {
    ...data,
    heading: quarterLabel(data.starts_on),
    range: quarterRange(data.starts_on),
    previous: shiftQuarter(data.starts_on, -1),
    next: shiftQuarter(data.starts_on, 1),
    openingWeek: isOpeningWeek(data.starts_on),
    reviews: data.reviews.map((review) => ({
      ...review,
      label: monthLabel(review.month_start),
    })),
  };
}

function presentHistory(items) {
  return items.map((item) => ({ ...item, label: quarterChip(item.starts_on) }));
}

export default function QuarterTool() {
  const [params, setParams] = useSearchParams();
  const quarterOn = normalizeQuarter(params.get('on'));
  const todayQuarter = currentQuarterIso();
  const [quarter, setQuarter] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openQuarter = (iso) => {
    const next = normalizeQuarter(iso);
    if (next === quarterOn) return;
    setLoading(true);
    setParams({ on: next }, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const end = quarterOn > todayQuarter ? quarterOn : todayQuarter;
    try {
      const [quarterRes, historyRes] = await Promise.all([
        api.get(QUARTER_API, { params: { on: quarterOn } }),
        api.get(`${QUARTER_API}/history`, { params: { limit: 6, anchor: end } }),
      ]);
      setQuarter(presentQuarter(quarterRes.data));
      setHistory(presentHistory(historyRes.data));
    } catch (err) {
      console.error(err);
      setError(errorText(err, 'Не удалось загрузить план квартала'));
    } finally {
      setLoading(false);
    }
  }, [quarterOn, todayQuarter]);

  useEffect(() => {
    load();
  }, [load]);

  const applyQuarter = (data) => {
    const next = presentQuarter(data);
    setQuarter(next);
    setHistory((items) =>
      items.map((item) =>
        item.starts_on === next.starts_on
          ? {
              ...item,
              exists: next.exists,
              total: next.total,
              done: next.done,
              needs_review: next.total > 0 && next.done < next.total && !(next.retrospective || '').trim(),
            }
          : item,
      ),
    );
  };

  const runChange = async (request, fallback) => {
    setSaving(true);
    setError('');
    try {
      const { data } = await request();
      applyQuarter(data);
      return true;
    } catch (err) {
      console.error(err);
      setError(errorText(err, fallback));
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading && (!quarter || quarter.starts_on !== quarterOn)) {
    return <p className="text-sm text-gray-500 py-16 text-center">Загрузка...</p>;
  }
  if (!quarter) {
    return <p className="text-sm text-red-600">{error || 'Нет данных'}</p>;
  }

  return (
    <QuarterPlan
      quarter={quarter}
      history={history}
      todayQuarter={todayQuarter}
      saving={saving}
      error={error}
      onOpen={openQuarter}
      onCreate={() =>
        runChange(
          () => api.post(QUARTER_API, { on: quarterOn }),
          'Не удалось составить план',
        )
      }
      onAddBlock={(title) =>
        runChange(
          () => api.post(`${QUARTER_API}/blocks`, { on: quarterOn, title }),
          'Не удалось добавить блок',
        )
      }
      onRenameBlock={(block, title) =>
        runChange(
          () => api.patch(`${QUARTER_API}/blocks/${block.id}`, { title }),
          'Не удалось переименовать блок',
        )
      }
      onMoveBlock={(block, position) =>
        runChange(
          () => api.patch(`${QUARTER_API}/blocks/${block.id}`, { position }),
          'Не удалось переставить блок',
        )
      }
      onDeleteBlock={(block) => {
        const warning = block.tasks.length
          ? 'Удалить блок вместе с его задачами?'
          : 'Удалить блок?';
        if (!window.confirm(warning)) return;
        runChange(
          () => api.delete(`${QUARTER_API}/blocks/${block.id}`),
          'Не удалось удалить блок',
        );
      }}
      onAddTask={(blockId, title) =>
        runChange(
          () => api.post(`${QUARTER_API}/tasks`, { block_id: blockId, title }),
          'Не удалось добавить задачу',
        )
      }
      onToggleTask={(task) =>
        runChange(
          () => api.patch(`${QUARTER_API}/tasks/${task.id}`, { is_done: !task.is_done }),
          'Не удалось обновить задачу',
        )
      }
      onMoveTask={(task, position) =>
        runChange(
          () => api.patch(`${QUARTER_API}/tasks/${task.id}`, { position }),
          'Не удалось переставить задачу',
        )
      }
      onRenameTask={(task, title) =>
        runChange(
          () => api.patch(`${QUARTER_API}/tasks/${task.id}`, { title }),
          'Не удалось сохранить задачу',
        )
      }
      onDeleteTask={(task) => {
        if (!window.confirm('Убрать задачу из плана?')) return;
        runChange(
          () => api.delete(`${QUARTER_API}/tasks/${task.id}`),
          'Не удалось удалить задачу',
        );
      }}
      onSaveReview={(monthIndex, note) =>
        runChange(
          () => api.put(`${QUARTER_API}/reviews`, { on: quarterOn, month_index: monthIndex, note }),
          'Не удалось сохранить итог месяца',
        )
      }
      onSaveRetrospective={(retrospective) =>
        runChange(
          () => api.patch(QUARTER_API, { on: quarterOn, retrospective }),
          'Не удалось сохранить итог квартала',
        )
      }
    />
  );
}
