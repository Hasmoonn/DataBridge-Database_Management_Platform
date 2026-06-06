const TransferHistorySkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-[#14213d] rounded-xl border border-white/8 p-3 sm:p-5 animate-pulse"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-16 bg-white/6 rounded" />
            <div className="h-4 w-48 bg-white/6 rounded" />
          </div>
          <div className="h-6 w-20 bg-white/6 rounded-full" />
        </div>
        <div className="h-2 w-full bg-white/6 rounded-full mb-2" />
        <div className="h-3 w-32 bg-white/6 rounded" />
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
          <div className="h-10 bg-white/6 rounded" />
          <div className="h-10 bg-white/6 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default TransferHistorySkeleton;
