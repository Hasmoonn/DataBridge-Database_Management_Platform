import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-medium text-[#e5e5e5]/80 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-[#fca311] ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e5e5e5]/50" />
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={clsx(
            "w-full bg-white/5 text-white placeholder-[#e5e5e5]/40",
            "border border-white/10 rounded-lg px-4 py-2.5",
            "focus:outline-none focus:border-[#fca311] focus:ring-2 focus:ring-[#fca311]/20",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            Icon && "pl-10",
            isPassword && "pr-10",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e5e5e5]/50 hover:text-[#fca311] transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
