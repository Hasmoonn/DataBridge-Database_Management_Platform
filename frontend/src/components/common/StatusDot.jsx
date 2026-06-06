import clsx from 'clsx';

const StatusDot = ({ status = 'inactive', size = 'md' }) => {
  const colors = {
    active: 'bg-green-500',
    connected: 'bg-green-500',
    online: 'bg-green-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    failed: 'bg-red-500',
    warning: 'bg-yellow-500',
    running: 'bg-[#fca311]',
    pending: 'bg-[#fca311]',
    inactive: 'bg-gray-500',
    untested: 'bg-gray-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const shouldPulse = ['active', 'connected', 'online', 'running'].includes(status);

  return (
    <span className="relative flex items-center justify-center">
      {shouldPulse && (
        <span
          className={clsx(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-50',
            colors[status]
          )}
        />
      )}
      <span className={clsx('relative rounded-full', sizes[size], colors[status])} />
    </span>
  );
};

export default StatusDot;