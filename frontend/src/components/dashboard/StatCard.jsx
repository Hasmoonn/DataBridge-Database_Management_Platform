import clsx from 'clsx';

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = '#fca311',
  loading = false,
  isPercent = false,
  percent = 0,
}) => {
  if (loading) {
    return (
      <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5 space-y-2 sm:space-y-3">
        <div className="flex justify-between">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/6 animate-pulse" />
          <div className="w-12 sm:w-16 h-4 bg-white/6 rounded animate-pulse" />
        </div>
        <div className="w-16 sm:w-20 h-6 sm:h-8 bg-white/6 rounded animate-pulse" />
        <div className="w-24 sm:w-32 h-3 bg-white/6 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5 hover:border-white/15 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        {/* Icon */}
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={18} className="sm:!w-5 sm:!h-5" style={{ color }} />
        </div>

        {/* Percent Ring (for success rate) */}
        {isPercent && (
          <svg width="44" height="44" viewBox="0 0 44 44" className="opacity-60 hidden sm:block">
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - percent / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
              className="transition-all duration-1000"
            />
          </svg>
        )}
      </div>

      {/* Value */}
      <div className="mb-0.5 sm:mb-1">
        <span className="text-xl sm:text-3xl font-bold text-white">{value}</span>
      </div>

      {/* Label */}
      <p className="text-[10px] sm:text-xs text-[#e5e5e5]/60 mb-1 sm:mb-2 leading-tight">{label}</p>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1">
          {trendUp && (
            <TrendingUp size={12} style={{ color }} className="hidden sm:block" />
          )}
          <span
            className="text-[10px] sm:text-xs leading-tight"
            style={{ color: trendUp ? color : 'rgba(229,229,229,0.5)' }}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

// Need TrendingUp import
import { TrendingUp } from 'lucide-react';

export default StatCard;