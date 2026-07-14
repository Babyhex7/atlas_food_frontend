import React, { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] border transition-all duration-200 focus:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:opacity-45 disabled:cursor-not-allowed select-none whitespace-nowrap";

    const variants: Record<string, string> = {
      primary:
        "bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)] hover:-translate-y-px hover:shadow-[var(--shadow-md)] active:translate-y-0 active:shadow-none active:bg-[var(--color-primary-active)]",
      secondary:
        "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] hover:border-[var(--color-border-strong)] hover:-translate-y-px active:translate-y-0",
      outline:
        "bg-transparent text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:-translate-y-px active:bg-[var(--color-primary-muted)] active:translate-y-0",
      ghost:
        "bg-transparent text-[var(--color-text-secondary)] border-transparent hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-border)]",
      danger:
        "bg-[var(--color-danger)] text-white border-[var(--color-danger)] hover:bg-[#b91c1c] hover:-translate-y-px hover:shadow-[var(--shadow-md)] active:bg-[#991b1b] active:translate-y-0",
    };

    const sizes: Record<string, string> = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base rounded-[var(--radius-lg)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${isLoading ? "relative text-transparent pointer-events-none" : ""} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4"
              style={{ color: variant === "outline" || variant === "ghost" || variant === "secondary" ? "var(--color-text-secondary)" : "white" }}
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
