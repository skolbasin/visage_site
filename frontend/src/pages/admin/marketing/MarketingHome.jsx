import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MARKETING_TOOLS, marketingToolGroups } from './tools';

function ToolCard({ tool }) {
  const Icon = tool.icon;
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!tool.loadStatus) return undefined;
    let cancelled = false;
    tool
      .loadStatus()
      .then((text) => {
        if (!cancelled) setStatus(text);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [tool]);

  return (
    <Link
      to={`/admin/marketing/${tool.path}`}
      className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-[#4a7c59] transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#eef5f0] text-[#4a7c59] flex items-center justify-center">
          <Icon size={20} />
        </div>
        <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2 py-1">{tool.cost}</span>
      </div>
      <h2 className="text-xl font-serif text-gray-900 mt-4">{tool.title}</h2>
      <p className="text-sm text-gray-600 mt-2 flex-1">{tool.summary}</p>
      {status && <p className="text-sm text-gray-900 mt-3">{status}</p>}
      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <div>Сложность: {tool.difficulty}</div>
        <div>{tool.cadence}</div>
      </dl>
      <span className="mt-4 text-sm text-[#4a7c59]">Открыть</span>
    </Link>
  );
}

export default function MarketingHome() {
  const groups = marketingToolGroups(MARKETING_TOOLS);
  const showGroupTitles = groups.length > 1;

  return (
    <div className="space-y-8">
      {groups.map(([name, tools]) => (
        <section key={name}>
          {showGroupTitles && <h2 className="text-sm font-medium text-gray-500 mb-3">{name}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
