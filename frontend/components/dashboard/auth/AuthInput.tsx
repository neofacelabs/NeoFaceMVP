import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, suffix, type = "text", className, placeholder, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasVal, setHasVal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    // Continuously check input value to handle autocomplete, programmatic fills (Demo account buttons), etc.
    useEffect(() => {
      const check = () => {
        if (inputRef.current) {
          setHasVal(inputRef.current.value.length > 0);
        }
      };
      check();
      const interval = setInterval(check, 100);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col gap-1 relative w-full group">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-white/20 pointer-events-none z-10 transition-colors group-focus-within:text-blue-500">
              {icon}
            </div>
          )}
          <input
            ref={inputRef}
            type={type}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "w-full h-[50px] bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 rounded-2xl outline-none text-[14.5px] text-white px-4 transition-all duration-300",
              icon ? "pl-11" : "pl-4",
              suffix ? "pr-11" : "pr-4",
              focused && "border-blue-500/60 ring-2 ring-blue-500/10 shadow-[inset_0_0_8px_rgba(59,130,246,0.08)]",
              error && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10 shadow-none",
              className
            )}
            placeholder={focused ? placeholder : ""}
            {...props}
          />
          {/* Floating label */}
          <label
            className={cn(
              "absolute left-4 pointer-events-none transition-all duration-200 text-white/30 text-xs font-semibold uppercase tracking-wider select-none",
              icon && "left-11",
              (focused || hasVal)
                ? "-top-2.5 left-3 px-2 bg-[#0B0B0B] text-blue-400 text-[10px] tracking-[0.15em] border border-white/[0.05] rounded-md scale-90"
                : "top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-widest font-bold"
            )}
          >
            {label}
          </label>
          {suffix && (
            <div className="absolute right-4 text-white/35 z-10">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-red-500/80 font-bold mt-1 px-1">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
