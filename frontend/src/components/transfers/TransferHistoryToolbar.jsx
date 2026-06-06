import { Search, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest first' },
  { value: 'created_at-asc', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'total_rows-desc', label: 'Most rows' },
];

const TransferHistoryToolbar = ({
  search,
  onSearchChange,
  sortField,
  sortDir,
  onSortChange,
  activeFilter,
  onClearFilters,
  resultCount,
  totalCount,
}) => {
  const sortValue = `${sortField}-${sortDir}`;
  const hasFilters = search.trim() || activeFilter !== 'all';

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm bg-black/40 border border-white/8 text-white placeholder-white/30 focus:outline-none focus:border-[#fca311]/50 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative sm:w-48">
          <SlidersHorizontal
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <select
            value={sortValue}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-');
              onSortChange(field, dir);
            }}
            className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-lg text-sm bg-black/40 border border-white/8 text-[#e5e5e5] focus:outline-none focus:border-[#fca311]/50 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#14213d]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results bar */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-[#e5e5e5]/50">
          Showing{' '}
          <span className="text-white font-medium">{resultCount}</span>
          {' '}of{' '}
          <span className="text-white font-medium">{totalCount}</span>
          {' '}transfers
        </span>

        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className={clsx(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full',
              'text-[#fca311] hover:bg-[#fca311]/10 transition-colors'
            )}
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TransferHistoryToolbar;
