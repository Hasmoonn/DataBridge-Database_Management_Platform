import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const Select = ({
  label,
  error,
  hint,
  className = '',
  options = [],
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-[#e5e5e5]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={clsx(
            'w-full appearance-none px-4 py-2.5 rounded-lg text-sm',
            'bg-white/5 border text-white',
            'focus:outline-none focus:ring-[3px] focus:ring-[#fca311]/15 focus:border-[#fca311]',
            'transition-all duration-200',
            'pr-10',
            error
              ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]/15'
              : 'border-white/12 hover:border-white/20',
            !props.value && !props.defaultValue ? 'text-[#e5e5e5]/50' : 'text-white'
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#14213d] text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/50 pointer-events-none"
        />
      </div>
      {error && (
        <p className="text-xs text-[#ef4444] flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[#e5e5e5]/50">{hint}</p>
      )}
    </div>
  );
};

export default Select;