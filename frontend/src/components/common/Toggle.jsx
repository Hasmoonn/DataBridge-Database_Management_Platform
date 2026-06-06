import clsx from 'clsx';

const Toggle = ({
  enabled,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-5 h-5', translate: 'translate-x-7' },
  };

  const s = sizes[size];
  const hasText = label || description;

  return (
    <div
      className={clsx(
        'flex gap-3',
        hasText ? 'items-start' : 'items-center',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label || 'Toggle'}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={clsx(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2 focus:ring-offset-black',
          s.track,
          enabled ? 'bg-[#fca311]' : 'bg-white/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out',
            s.thumb,
            'absolute top-1/2 -translate-y-1/2 left-0.5',
            enabled ? s.translate : 'translate-x-0'
          )}
        />
      </button>
      {hasText && (
        <div className="flex flex-col min-w-0 pt-0.5">
          {label && (
            <span className="text-sm font-medium text-white">{label}</span>
          )}
          {description && (
            <span className="text-xs text-[#e5e5e5]/50 mt-0.5">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;