import { Loader2 } from "lucide-react";
import clsx from "clsx";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  onClick,
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-[#fca311] text-black font-bold hover:brightness-110 disabled:opacity-50",
    secondary:
      "border border-[#fca311] text-[#fca311] bg-transparent hover:bg-[#fca311]/10 disabled:opacity-50",
    outline:
      "border border-white/12 text-[#e5e5e5] bg-transparent hover:bg-white/5 hover:border-white/20 disabled:opacity-50",
    danger:
      "border border-red-500 text-red-500 bg-transparent hover:bg-red-500/10 disabled:opacity-50",
    ghost: "text-[#e5e5e5] hover:bg-white/5 disabled:opacity-50",
    dangerSolid:
      "bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#fca311] focus:ring-offset-2 focus:ring-offset-[#14213d]",
        "disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};

export default Button;
