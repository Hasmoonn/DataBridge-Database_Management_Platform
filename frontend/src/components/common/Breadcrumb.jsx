import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const Breadcrumb = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-1" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
            )}
            {isLast ? (
              <span className="text-sm font-semibold text-white">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.href && navigate(item.href)}
                className={clsx(
                  'text-sm text-[#e5e5e5]/60 transition-colors duration-150',
                  item.href && 'hover:text-white cursor-pointer hover:underline'
                )}
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;