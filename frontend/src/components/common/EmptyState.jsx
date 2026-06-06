const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 sm:py-16 px-4 sm:px-6">
      {/* Icon - handles both JSX element and component */}
      {icon && (
        <div className="w-20 h-20 rounded-full bg-[#fca311]/10 border border-[#fca311]/20 flex items-center justify-center mb-5 text-[#fca311]">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#e5e5e5]/60 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;