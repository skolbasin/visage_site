import { useMemo, useState } from 'react';
import { formatMoney } from '../../data/calendarConstants';

const CATEGORY_COLORS = [
  '#4a7c59',
  '#c4785a',
  '#3d6f8f',
  '#c4a35a',
  '#7d6b9a',
  '#5a9a86',
  '#b85c6a',
  '#7a8f4a',
  '#d08a4c',
  '#4f7a9a',
  '#a36b4a',
  '#6b7c8a',
];

function formatShare(part, total) {
  if (!total) return '0%';
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(part / total);
}

function groupByCategory(items) {
  const buckets = new Map();
  items.forEach((item) => {
    const id = item.category_id;
    const current = buckets.get(id) || {
      id,
      name: item.category_name || 'Без категории',
      total: 0,
    };
    current.total += Number(item.amount) || 0;
    buckets.set(id, current);
  });
  return [...buckets.values()]
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'ru'));
}

function buildColorMap(items) {
  const names = [...new Set(items.map((item) => item.category_name || 'Без категории'))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  );
  const map = {};
  names.forEach((name, index) => {
    map[name] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  });
  return map;
}

function polar(cx, cy, radius, angle) {
  return [cx + radius * Math.sin(angle), cy - radius * Math.cos(angle)];
}

function donutSlicePath(cx, cy, outer, inner, start, end) {
  const large = end - start > Math.PI ? 1 : 0;
  const [x1, y1] = polar(cx, cy, outer, start);
  const [x2, y2] = polar(cx, cy, outer, end);
  const [x3, y3] = polar(cx, cy, inner, end);
  const [x4, y4] = polar(cx, cy, inner, start);
  return `M ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
}

function buildArcs(slices, total) {
  if (!slices.length || total <= 0) return [];
  if (slices.length === 1) return [{ ...slices[0], full: true }];

  const gap = 0.04;
  const available = Math.PI * 2 - gap * slices.length;
  let cursor = 0;
  return slices.map((slice) => {
    const sweep = (slice.total / total) * available;
    const start = cursor;
    cursor += sweep + gap;
    return { ...slice, start, end: start + sweep, full: false };
  });
}

function sliceValue(slice, total, metric) {
  if (metric === 'percent') return formatShare(slice.total, total);
  return formatMoney(slice.total);
}

function restingCenter(total, sliceTotal, metric) {
  const hasShare = metric === 'percent' && sliceTotal > 0 && Math.abs(sliceTotal - total) > 0.009;
  if (hasShare) {
    return { value: formatShare(total, sliceTotal), caption: formatMoney(total) };
  }
  return { value: formatMoney(total), caption: 'всего' };
}

function CategoryColumn({ slices, total, metric, activeId, onHover }) {
  if (!slices.length) return <div className="flex-1" />;

  return (
    <ul className="flex-1 space-y-1 min-w-0">
      {slices.map((slice) => {
        const active = activeId === slice.id;
        return (
          <li key={slice.id}>
            <button
              type="button"
              onMouseEnter={() => onHover(slice.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(slice.id)}
              onBlur={() => onHover(null)}
              className={`w-full flex items-center gap-2 text-left text-sm rounded-md px-1.5 py-1 ${
                active ? 'bg-gray-50' : ''
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-600 truncate min-w-0" title={slice.name}>
                {slice.name}
              </span>
              <span className="ml-auto pl-2 font-medium text-gray-900 tabular-nums shrink-0">
                {sliceValue(slice, total, metric)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Donut({ slices, total, metric, activeId, onHover, sliceTotal, size = 176 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.466;
  const inner = size * 0.307;
  const arcs = buildArcs(slices, total);
  const active = slices.find((slice) => slice.id === activeId) || null;
  const resting = restingCenter(total, sliceTotal, metric);
  const centerValue = active ? sliceValue(active, total, metric) : resting.value;
  const centerCaption = active ? active.name : resting.caption;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Диаграмма расходов">
        {arcs.length === 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={(outer + inner) / 2}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={outer - inner}
          />
        )}
        {arcs.map((arc) =>
          arc.full ? (
            <g
              key={arc.id}
              onMouseEnter={() => onHover(arc.id)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer"
            >
              <circle cx={cx} cy={cy} r={outer} fill={arc.color} />
              <circle cx={cx} cy={cy} r={inner} fill="white" />
              <title>
                {arc.name}: {formatMoney(arc.total)} ({formatShare(arc.total, total)})
              </title>
            </g>
          ) : (
            <path
              key={arc.id}
              d={donutSlicePath(cx, cy, outer, inner, arc.start, arc.end)}
              fill={arc.color}
              opacity={!activeId || activeId === arc.id ? 1 : 0.35}
              className="cursor-pointer"
              onMouseEnter={() => onHover(arc.id)}
              onMouseLeave={() => onHover(null)}
            >
              <title>
                {arc.name}: {formatMoney(arc.total)} ({formatShare(arc.total, total)})
              </title>
            </path>
          ),
        )}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center"
        style={{ paddingLeft: size * 0.22, paddingRight: size * 0.22 }}
      >
        <div className={`${size < 160 ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 leading-tight`}>
          {centerValue}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-full">{centerCaption}</div>
      </div>
    </div>
  );
}

function ExpenseDonutCard({ title, items, metric, colors, sliceTotal, layout }) {
  const [activeId, setActiveId] = useState(null);
  const slices = useMemo(
    () =>
      groupByCategory(items).map((row) => ({
        ...row,
        color: colors[row.name] || '#9ca3af',
      })),
    [items, colors],
  );
  const total = slices.reduce((sum, slice) => sum + slice.total, 0);
  const mid = Math.ceil(slices.length / 2);
  const left = slices.slice(0, mid);
  const right = slices.slice(mid);
  const donut = (
    <Donut
      slices={slices}
      total={total}
      metric={metric}
      activeId={activeId}
      onHover={setActiveId}
      sliceTotal={sliceTotal}
      size={layout === 'compact' ? 148 : 176}
    />
  );

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-4 min-w-0">
      <h3 className="text-sm font-medium text-gray-800 mb-3 text-center md:text-left">{title}</h3>
      {slices.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">Нет трат</div>
      ) : layout === 'compact' ? (
        <div className="flex flex-col items-center">
          {donut}
          <div className="w-full mt-3">
            <CategoryColumn
              slices={slices}
              total={total}
              metric={metric}
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:flex items-center gap-4">
            <CategoryColumn
              slices={left}
              total={total}
              metric={metric}
              activeId={activeId}
              onHover={setActiveId}
            />
            {donut}
            <CategoryColumn
              slices={right}
              total={total}
              metric={metric}
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>
          <div className="md:hidden flex flex-col items-center gap-4">
            {donut}
            <CategoryColumn
              slices={slices}
              total={total}
              metric={metric}
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>
        </>
      )}
    </section>
  );
}

export default function ExpenseDonuts({ items, mode, metric }) {
  const { colors, sereja, nastya, sliceTotal } = useMemo(() => {
    const serejaItems = items.filter((item) => item.paid_by === 'sereja');
    const nastyaItems = items.filter((item) => item.paid_by === 'nastya');
    const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    return {
      colors: buildColorMap(items),
      sereja: serejaItems,
      nastya: nastyaItems,
      sliceTotal: total,
    };
  }, [items]);

  return (
    <div className="mb-6">
      {mode === 'people' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ExpenseDonutCard
            title="Серёжа"
            items={sereja}
            metric={metric}
            colors={colors}
            sliceTotal={sliceTotal}
            layout="compact"
          />
          <ExpenseDonutCard
            title="Всего"
            items={items}
            metric={metric}
            colors={colors}
            sliceTotal={sliceTotal}
            layout="compact"
          />
          <ExpenseDonutCard
            title="Настя"
            items={nastya}
            metric={metric}
            colors={colors}
            sliceTotal={sliceTotal}
            layout="compact"
          />
        </div>
      ) : (
        <ExpenseDonutCard
          title="Общее"
          items={items}
          metric={metric}
          colors={colors}
          sliceTotal={sliceTotal}
          layout="sides"
        />
      )}
    </div>
  );
}
