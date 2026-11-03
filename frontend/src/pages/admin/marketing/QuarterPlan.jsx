import { useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Trash2 } from 'lucide-react';

function NoteField({ label, hint, initial, disabled, onSave, placeholder }) {
  const [text, setText] = useState(initial || '');
  const saved = useRef(initial || '');

  const commit = async () => {
    const next = text.trim();
    if (next === saved.current) return;
    const ok = await onSave(next);
    if (ok) saved.current = next;
  };

  return (
    <label className="block text-sm text-gray-600">
      <span className="font-medium text-gray-800">{label}</span>
      {hint && <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>}
      <textarea
        value={text}
        disabled={disabled}
        rows={3}
        maxLength={4000}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
      />
    </label>
  );
}

function TaskRow({ task, isFirst, isLast, disabled, onToggle, onMove, onRename, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [editing, setEditing] = useState(false);

  const save = () => {
    const next = title.trim();
    if (!next || next === task.title) {
      setEditing(false);
      setTitle(task.title);
      return;
    }
    onRename(task, next);
    setEditing(false);
  };

  return (
    <li className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <input
        type="checkbox"
        checked={task.is_done}
        disabled={disabled}
        onChange={() => onToggle(task)}
        className="mt-1 h-4 w-4 accent-[#4a7c59]"
        aria-label={task.is_done ? 'Вернуть задачу' : 'Отметить задачу сделанной'}
      />
      {editing ? (
        <input
          value={title}
          autoFocus
          maxLength={300}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              setTitle(task.title);
              setEditing(false);
            }
          }}
          className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`flex-1 text-left text-sm ${task.is_done ? 'line-through text-gray-400' : 'text-gray-900'}`}
        >
          {task.title}
        </button>
      )}
      <div className="flex">
        <button
          type="button"
          disabled={disabled || isFirst}
          onClick={() => onMove(task, task.position - 1)}
          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
          aria-label="Выше"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          disabled={disabled || isLast}
          onClick={() => onMove(task, task.position + 1)}
          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
          aria-label="Ниже"
        >
          <ChevronDown size={14} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(task)}
          className="p-1 text-gray-400 hover:text-red-600"
          aria-label="Удалить задачу"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}

export function QuarterPlan({
  quarter,
  history,
  todayQuarter,
  saving,
  error,
  onOpen,
  onCreate,
  onAddBlock,
  onRenameBlock,
  onMoveBlock,
  onDeleteBlock,
  onAddTask,
  onToggleTask,
  onMoveTask,
  onRenameTask,
  onDeleteTask,
  onSaveReview,
  onSaveRetrospective,
}) {
  const [blockTitle, setBlockTitle] = useState('');
  const [taskDrafts, setTaskDrafts] = useState({});
  const total = quarter?.total || 0;
  const done = quarter?.done || 0;
  const maxTasks = quarter?.max_tasks || 40;
  const softMax = quarter?.soft_max || 30;
  const atLimit = total >= maxTasks;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const previous = (history || []).filter(
    (item) => item.starts_on < quarter.starts_on && item.needs_review,
  );
  const openReview = previous.length ? previous[previous.length - 1] : null;

  const addBlock = async (event) => {
    event.preventDefault();
    const title = blockTitle.trim();
    if (!title) return;
    const saved = await onAddBlock(title);
    if (saved) setBlockTitle('');
  };

  const addTask = async (event, blockId) => {
    event.preventDefault();
    const title = (taskDrafts[blockId] || '').trim();
    if (!title || atLimit) return;
    const saved = await onAddTask(blockId, title);
    if (saved) setTaskDrafts((current) => ({ ...current, [blockId]: '' }));
  };

  return (
    <div className="max-w-5xl">
      <p className="text-sm text-gray-500 mb-4">
        Одна страница на квартал: только главное, по блокам. Раз в месяц короткий итог, в конце — почему что-то не сделано.
      </p>

      <div className="overflow-x-auto mb-4 -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {history.map((item) => {
            const active = item.starts_on === quarter.starts_on;
            return (
              <button
                key={item.starts_on}
                type="button"
                onClick={() => onOpen(item.starts_on)}
                className={`px-3 py-2 rounded-lg text-left text-xs border transition ${
                  active
                    ? 'border-[#4a7c59] bg-[#eef5f0] text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div>{item.label}</div>
                <div className={item.needs_review ? 'text-amber-700' : 'text-gray-400'}>
                  {item.total ? `${item.done}/${item.total}` : 'нет плана'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpen(quarter.previous)}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
              aria-label="Предыдущий квартал"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => onOpen(quarter.next)}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
              aria-label="Следующий квартал"
            >
              <ChevronRight size={18} />
            </button>
            {quarter.starts_on !== todayQuarter && (
              <button type="button" onClick={() => onOpen(todayQuarter)} className="text-sm text-[#4a7c59] px-2">
                Этот квартал
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {total ? `${done} из ${total} · ${percent}%` : 'Пусто'}
          </div>
        </div>

        <div className="text-xs tracking-wide uppercase text-[#6b5b3e]">90 дней</div>
        <h2 className="text-2xl font-serif text-gray-900 mt-1">{quarter.heading}</h2>
        <p className="text-sm text-gray-500 mt-1">{quarter.range}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-4 mb-4">
          <div className="h-full bg-[#4a7c59]" style={{ width: `${percent}%` }} />
        </div>

        {quarter.openingWeek && !quarter.exists && (
          <p className="text-sm text-amber-800 mb-3">
            Первая неделя квартала: самое время утвердить план.
          </p>
        )}
        {openReview && (
          <p className="text-sm text-amber-800 mb-3">
            {openReview.label}: сделано {openReview.done} из {openReview.total}. Запишите, почему остальное не закрыто.{' '}
            <button type="button" className="underline" onClick={() => onOpen(openReview.starts_on)}>
              Открыть
            </button>
          </p>
        )}
        {total >= softMax && total < maxTasks && (
          <p className="text-sm text-gray-600 mb-3">
            Больше тридцати задач уже трудно удержать на одной странице.
          </p>
        )}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {!quarter.exists ? (
          <div className="py-6">
            <p className="text-sm text-gray-600 mb-4">
              План ещё не составлен. Появятся блоки: интернет, привлечение, удержание, аналитика и PR — лишние можно убрать.
            </p>
            <button
              type="button"
              disabled={saving}
              onClick={onCreate}
              className="bg-[#4a7c59] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              Составить план
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {quarter.reviews.map((review) => (
                <NoteField
                  key={`${quarter.starts_on}-${review.month_index}`}
                  label={review.label}
                  hint="Итог месяца"
                  initial={review.note}
                  disabled={saving}
                  placeholder="Что сдвинулось и где отклонение"
                  onSave={(note) => onSaveReview(review.month_index, note)}
                />
              ))}
            </div>

            {total > 0 && done === total && (
              <p className="text-sm text-[#3d6b4a] mb-4">Все задачи квартала закрыты.</p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {quarter.blocks.map((block, index) => (
                <section key={block.id} className="border border-gray-100 rounded-xl p-4 bg-[#faf8f4]">
                  <div className="flex items-start gap-2 mb-2">
                    <BlockTitle
                      title={block.title}
                      disabled={saving}
                      onSave={(title) => onRenameBlock(block, title)}
                    />
                    <button
                      type="button"
                      disabled={saving || index === 0}
                      onClick={() => onMoveBlock(block, block.position - 1)}
                      className="p-1 text-gray-400 disabled:opacity-30"
                      aria-label="Блок выше"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={saving || index === quarter.blocks.length - 1}
                      onClick={() => onMoveBlock(block, block.position + 1)}
                      className="p-1 text-gray-400 disabled:opacity-30"
                      aria-label="Блок ниже"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onDeleteBlock(block)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      aria-label="Удалить блок"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ul>
                    {block.tasks.map((task, taskIndex) => (
                      <TaskRow
                        key={`${task.id}:${task.title}`}
                        task={task}
                        isFirst={taskIndex === 0}
                        isLast={taskIndex === block.tasks.length - 1}
                        disabled={saving}
                        onToggle={onToggleTask}
                        onMove={onMoveTask}
                        onRename={onRenameTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </ul>
                  {atLimit ? null : (
                    <form onSubmit={(event) => addTask(event, block.id)} className="mt-2 flex gap-2">
                      <input
                        value={taskDrafts[block.id] || ''}
                        onChange={(event) =>
                          setTaskDrafts((current) => ({ ...current, [block.id]: event.target.value }))
                        }
                        maxLength={300}
                        placeholder="Задача блока"
                        className="flex-1 border border-[#e4dcc8] rounded-lg px-3 py-1.5 text-sm bg-white"
                      />
                      <button
                        type="submit"
                        disabled={saving || !(taskDrafts[block.id] || '').trim()}
                        className="text-sm px-3 py-1.5 rounded-lg bg-[#4a7c59] text-white disabled:opacity-50"
                      >
                        Добавить
                      </button>
                    </form>
                  )}
                </section>
              ))}
            </div>

            {atLimit && (
              <p className="text-sm text-gray-600 mt-4">
                Сорок задач — потолок. Дальше план перестаёт выполняться.
              </p>
            )}

            <form onSubmit={addBlock} className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                value={blockTitle}
                onChange={(event) => setBlockTitle(event.target.value)}
                maxLength={80}
                placeholder="Новый блок"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={saving || !blockTitle.trim()}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
              >
                Добавить блок
              </button>
            </form>

            <div className="mt-6">
              <NoteField
                key={`${quarter.starts_on}-retro-${quarter.retrospective || ''}`}
                label="Почему часть плана не сделана"
                hint="Нужно в конце квартала, до плана на следующие 90 дней"
                initial={quarter.retrospective || ''}
                disabled={saving}
                placeholder="Что помешало и что учесть в следующем квартале"
                onSave={onSaveRetrospective}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlockTitle({ title, disabled, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  const save = () => {
    const next = value.trim();
    if (next && next !== title) onSave(next);
    else setValue(title);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="flex-1 text-left font-medium text-gray-900">
        {title}
      </button>
    );
  }

  return (
    <input
      value={value}
      autoFocus
      disabled={disabled}
      maxLength={80}
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
      }}
      className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
    />
  );
}
