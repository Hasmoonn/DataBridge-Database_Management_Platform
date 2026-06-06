import { useState } from 'react';
import clsx from 'clsx';

const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 300,
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const show = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    clearTimeout(timeoutId);
    setVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && content && (
        <div
          className={clsx(
            'absolute z-50 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap',
            'bg-[#14213d] border border-white/12 shadow-xl',
            'pointer-events-none',
            positions[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;