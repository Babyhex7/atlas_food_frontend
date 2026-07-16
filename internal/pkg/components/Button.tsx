import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/internal/lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md border transition-fast focus:outline-none focus-visible:shadow-focus disabled:opacity-45 disabled:cursor-not-allowed select-none whitespace-nowrap";

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-white border-primary hover:bg-primary-hover hover:border-primary-hover hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-none active:bg-primary-active",
  secondary:
    "bg-surface text-text-secondary border-border hover:bg-surface-alt hover:border-border-strong hover:-translate-y-px active:translate-y-0",
  outline:
    "bg-transparent text-primary border-primary hover:bg-primary-light hover:-translate-y-px active:bg-primary-muted active:translate-y-0",
  ghost:
    "bg-transparent text-text-secondary border-transparent hover:bg-surface-alt hover:text-text-primary active:bg-border",
  danger:
    "bg-danger text-white border-danger hover:bg-danger-hover hover:-translate-y-px hover:shadow-md active:bg-danger-active active:translate-y-0",
};

const SIZES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base rounded-lg",
};

const SPINNER_MUTED_VARIANTS = new Set<ButtonProps["variant"]>(["outline", "ghost", "secondary"]);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          BASE,
          VARIANTS[variant],
          SIZES[size],
          isLoading && "relative text-transparent pointer-events-none",
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className={cn(
                "animate-spin h-4 w-4",
                SPINNER_MUTED_VARIANTS.has(variant) ? "text-text-secondary" : "text-white"
              )}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
