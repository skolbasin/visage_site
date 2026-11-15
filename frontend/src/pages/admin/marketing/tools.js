import { CalendarRange, ChartNoAxesCombined, ListChecks } from 'lucide-react';
import api from '../../../services/api';
import QuarterTool from './QuarterTool';
import Top5Tool from './Top5Tool';
import TrafficSources from './TrafficSources';

// Новый инструмент: страница + объект в этом списке.
// Пункт в меню раздела и маршрут подхватятся сами.
export const MARKETING_TOOLS = [
  {
    id: 'traffic-sources',
    path: 'traffic-sources',
    title: 'Источники трафика',
    group: 'Аналитика',
    summary:
      'Месячные расходы, обращения и показатели Profi.ru, Instagram и Pinterest в одном месте.',
    difficulty: 'Невысокая',
    cost: 'Для мониторинга',
    cadence: 'Раз в месяц',
    icon: ChartNoAxesCombined,
    Page: TrafficSources,
    loadStatus: async () => {
      const { data } = await api.get(`/admin/marketing/traffic-sources/${new Date().getFullYear()}`);
      const total = Object.values(data.sources)
        .flat()
        .reduce((sum, month) => sum + month.applications, 0);
      return `Заявок из источников за год: ${total}`;
    },
  },
  {
    id: 'top5',
    path: 'top-5',
    title: 'Топ-5',
    group: 'Планы',
    summary:
      'Пять дел на неделю одним списком, без привязки к дню. Сделанное вычёркивается.',
    difficulty: 'Низкая',
    cost: 'Бесплатно',
    cadence: 'Каждый понедельник',
    icon: ListChecks,
    Page: Top5Tool,
    loadStatus: async () => {
      const { data } = await api.get('/admin/marketing/top5');
      if (!data.total) return 'На эту неделю план ещё не составлен';
      return `Эта неделя: ${data.done} из ${data.total}`;
    },
  },
  {
    id: 'ninety',
    path: '90-days',
    title: '90 дней',
    group: 'Планы',
    summary:
      'План на квартал: ключевые задачи по блокам, не больше сорока. Раз в месяц фиксируется, что сдвинулось.',
    difficulty: 'Невысокая',
    cost: 'Бесплатно',
    cadence: 'Раз в квартал',
    icon: CalendarRange,
    Page: QuarterTool,
    loadStatus: async () => {
      const { data } = await api.get('/admin/marketing/quarters');
      if (!data.exists || !data.total) return 'Квартальный план ещё не составлен';
      const percent = Math.round((data.done / data.total) * 100);
      return `Этот квартал: ${data.done} из ${data.total} · ${percent}%`;
    },
  },
];

export function marketingToolGroups(tools) {
  const groups = new Map();
  tools.forEach((tool) => {
    const name = tool.group || 'Инструменты';
    const items = groups.get(name) || [];
    items.push(tool);
    groups.set(name, items);
  });
  return Array.from(groups.entries());
}
