import clsx from 'clsx';
import {
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

const STAT_ITEMS = [
  { key: 'all', label: 'Total', icon: History, color: '#fca311' },
  { key: 'running', label: 'Running', icon: Loader2, color: '#7dd3fc' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: '#22c55e' },
  { key: 'failed', label: 'Failed', icon: XCircle, color: '#ef4444' },
  { key: 'pending', label: 'Pending', icon: Clock, color: '#f59e0b' },
];

const TransferHistoryStats = ({ total, statusCounts, activeFilter, onFilterChange }) => {
  const getValue = (key) => {
    if (key === 'all') return total;
    return statusCounts[key] || 0;
  };

  return (
    <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.key;
        const value = getValue(item.key);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterChange(item.key)}
            className={clsx(
              'group relative rounded-xl border p-3 sm:p-4 text-left transition-all duration-200',
              'hover:border-white/20 hover:bg-white/[0.02]',
              'min-w-[110px] sm:min-w-0 flex-shrink-0 sm:flex-shrink',
              isActive
                ? 'border-[#fca311]/50 bg-[#fca311]/5 shadow-[0_0_0_1px_rgba(252,163,17,0.15)]'
                : 'border-white/8 bg-[#14213d]'
            )}
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <Icon
                  size={14}
                  className={clsx('sm:!w-4 sm:!h-4', item.key === 'running' && value > 0 && 'animate-spin')}
                  style={{ color: item.color }}
                />
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-[#fca311] flex-shrink-0" />
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-[#e5e5e5]/60 mb-0.5 sm:mb-1">{item.label}</p>
            <p
              className="text-lg sm:text-2xl font-bold font-mono leading-none"
              style={{ color: item.color }}
            >
              {value}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default TransferHistoryStats;
