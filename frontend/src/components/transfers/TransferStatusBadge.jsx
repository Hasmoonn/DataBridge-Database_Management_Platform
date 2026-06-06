import clsx from 'clsx';
import { getStatusConfig } from '../../utils/transferStatus';

const TransferStatusBadge = ({ status, className = '', showIcon = true }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: config.color }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: config.color }}
          />
        </span>
      )}
      {showIcon && !config.pulse && (
        <Icon
          size={12}
          className={clsx(status === 'running' && 'animate-spin')}
        />
      )}
      {config.label}
    </span>
  );
};

export default TransferStatusBadge;
