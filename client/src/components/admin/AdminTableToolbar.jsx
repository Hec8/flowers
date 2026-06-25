import { Search, RefreshCw, SlidersHorizontal } from 'lucide-react';

export default function AdminTableToolbar({
  title,
  search,
  onSearchChange,
  onRefresh,
  action,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Rechercher"
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm w-full sm:w-48 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 shrink-0"
            title="Actualiser"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        )}
        <button
          type="button"
          className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 shrink-0"
          title="Filtrer"
        >
          <SlidersHorizontal size={16} className="text-gray-500" />
        </button>
        {action && <div className="w-full sm:w-auto sm:ml-auto">{action}</div>}
      </div>
    </div>
  );
}
