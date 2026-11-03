import { NavLink, Outlet } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { MARKETING_TOOLS } from './marketing/tools';

function tabClass({ isActive }) {
  return `px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition ${
    isActive
      ? 'border-[#4a7c59] text-[#4a7c59] font-medium'
      : 'border-transparent text-gray-600 hover:text-gray-900'
  }`;
}

export default function AdminMarketingLayout() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={22} className="text-[#4a7c59]" />
          <h1 className="text-2xl font-serif text-gray-800">Маркетинг</h1>
        </div>
        <p className="text-sm text-gray-500">
          Инструменты, которые можно вести без бюджета. У каждого своя страница, список можно расширять.
        </p>
      </div>

      <div className="overflow-x-auto mb-6 -mx-1 px-1">
        <nav className="flex gap-1 min-w-max border-b border-gray-200">
          <NavLink to="/admin/marketing" end className={tabClass}>
            Все инструменты
          </NavLink>
          {MARKETING_TOOLS.map((tool) => (
            <NavLink key={tool.id} to={`/admin/marketing/${tool.path}`} className={tabClass}>
              {tool.title}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
