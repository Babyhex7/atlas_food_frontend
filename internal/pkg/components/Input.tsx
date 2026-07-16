import React, { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/internal/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, helper, className, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full gap-2">
        {label && (
          <label htmlFor={id} className="form-label text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] rounded-md outline-none font-sans transition-base",
            error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]"
              : "border-border focus:border-primary focus:shadow-focus",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {helper && !error && <span className="text-xs text-text-muted">{helper}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
