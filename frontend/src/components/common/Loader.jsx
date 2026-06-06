import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Loader = ({ size = 'md', fullScreen = false, message = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={clsx(sizes.lg, 'text-[#fca311] animate-spin')} />
          {message && <p className="text-[#e5e5e5] text-sm">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Loader2 className={clsx(sizes[size], 'text-[#fca311] animate-spin')} />
      {message && <span className="text-[#e5e5e5] text-sm">{message}</span>}
    </div>
  );
};

export default Loader;