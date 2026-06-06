import clsx from "clsx";

const Badge = ({
  children,
  variant = "default",
  status,
  pulse = false,
  className = "",
}) => {
  const statusVariantMap = {
    pending: "warning",
    running: "info",
    success: "success",
    error: "error",
    completed: "success",
    failed: "error",
    cancelled: "default",
  };

  const resolvedVariant = status
    ? statusVariantMap[status] || variant
    : variant;

  const variants = {
    default: "bg-white/10 text-[#e5e5e5]",
    success: "bg-green-500/15 text-green-500",
    error: "bg-red-500/15 text-red-500",
    warning: "bg-yellow-500/15 text-yellow-500",
    info: "bg-sky-400/15 text-sky-400",
    gold: "bg-[#fca311]/15 text-[#fca311]",
    postgresql: "bg-blue-500/20 text-blue-400",
    mysql: "bg-orange-500/20 text-orange-400",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variants[resolvedVariant],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={clsx(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              resolvedVariant === "success" && "bg-green-500",
              resolvedVariant === "error" && "bg-red-500",
              resolvedVariant === "warning" && "bg-yellow-500",
              resolvedVariant === "gold" && "bg-[#fca311]",
              resolvedVariant === "info" && "bg-sky-400",
            )}
          ></span>
          <span
            className={clsx(
              "relative inline-flex rounded-full h-2 w-2",
              resolvedVariant === "success" && "bg-green-500",
              resolvedVariant === "error" && "bg-red-500",
              resolvedVariant === "warning" && "bg-yellow-500",
              resolvedVariant === "gold" && "bg-[#fca311]",
              resolvedVariant === "info" && "bg-sky-400",
            )}
          ></span>
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
