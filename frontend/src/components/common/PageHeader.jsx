import { ChevronRight } from 'lucide-react';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <div className="mb-4 sm:mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-2 sm:mb-3 overflow-x-auto scrollbar-none">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1 flex-shrink-0">
              {index > 0 && (
                <ChevronRight size={14} className="text-white/30" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-none">
                  {crumb.label}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-[#e5e5e5]/60 hover:text-white cursor-pointer transition-colors">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-[#e5e5e5]/60">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-shrink-0 sm:justify-end w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
