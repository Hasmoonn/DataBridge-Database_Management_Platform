import clsx from 'clsx';

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercent = false,
  size = 'md',
  color = 'gold',
  animated = false,
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    gold: 'bg-[#fca311]',
    green: 'bg-[#22c55e]',
    red: 'bg-[#ef4444]',
    blue: 'bg-[#7dd3fc]',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs text-[#e5e5e5]/70">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-mono text-[#fca311]">
              {percent.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={clsx(
          'w-full rounded-full bg-white/8 overflow-hidden',
          sizes[size]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;