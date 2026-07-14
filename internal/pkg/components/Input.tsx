import React, { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, helper, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col w-full" style={{ gap: "var(--space-2)" }}>
        {label && (
          <label
            htmlFor={id}
            className="form-label"
            style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`${className}`}
          style={{
            width: "100%",
            padding: "0.625rem var(--space-3)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-primary)",
            backgroundColor: "var(--color-surface)",
            border: `1.5px solid ${error ? "var(--color-danger)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            outline: "none",
            transition: "var(--transition-base)",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--color-primary)";
            e.currentTarget.style.boxShadow = error
              ? "0 0 0 3px rgba(220,38,38,0.15)"
              : "var(--focus-ring)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-danger)" }}>{error}</span>
        )}
        {helper && !error && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>{helper}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
