"use client";

/**
 * Clean, modern, production-ready UI Primitives for Atlas Food Recall.
 * Strictly adheres to 4px multiplier spacing, restrained color palette,
 * clear typography hierarchy, and zero decorative AI slop.
 */

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import { ViewerLock } from "@/internal/domain/collab";

/* ── Shell & Layout ──────────────────────────────────────────────────────── */

export function StepShell({
  children,
  className,
  centered = false,
  maxWidth = "wide",
}: {
  children: ReactNode;
  className?: string;
  centered?: boolean;
  maxWidth?: "normal" | "wide" | "full";
}) {
  const maxWClass =
    maxWidth === "full"
      ? "max-w-full"
      : maxWidth === "normal"
        ? "max-w-3xl"
        : "max-w-5xl";

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8",
        maxWClass,
        centered && "items-center text-center",
        className,
      )}
    >
      <ViewerLock className="flex flex-col gap-6">{children}</ViewerLock>
    </div>
  );
}

export function StepHeader({
  title,
  subtitle,
  centered = false,
}: {
  title: string;
  subtitle?: ReactNode;
  centered?: boolean;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-1.5",
        centered && "items-center text-center",
      )}
    >
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

/* ── Card Container ──────────────────────────────────────────────────────── */

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface text-text-primary shadow-xs",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardLabel({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
      {Icon ? <Icon aria-hidden className="h-4 w-4 text-primary" /> : null}
      {children}
    </div>
  );
}

/* ── Informational Banners ───────────────────────────────────────────────── */

const BANNER_TONES = {
  info: "border-info-border bg-info-light text-info",
  success: "border-success-border bg-success-light text-success",
  warning: "border-warning-border bg-warning-light text-warning",
  danger: "border-danger-border bg-danger-light text-danger",
} as const;

export function Banner({
  icon: Icon,
  tone = "info",
  title,
  children,
  className,
}: {
  icon?: LucideIcon;
  tone?: keyof typeof BANNER_TONES;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-3.5 text-xs leading-relaxed sm:p-4",
        BANNER_TONES[tone],
        className,
      )}
    >
      {Icon ? <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /> : null}
      <div className="flex-1">
        {title ? (
          <strong className="mb-1 block font-semibold">{title}</strong>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */

const BUTTON_VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-active disabled:bg-border-strong disabled:text-text-placeholder disabled:border-transparent disabled:shadow-none disabled:hover:bg-border-strong disabled:cursor-not-allowed",
  secondary:
    "border border-border bg-surface text-text-primary hover:bg-surface-alt active:bg-border/30 disabled:border-border disabled:bg-surface-alt disabled:text-text-placeholder disabled:cursor-not-allowed",
  ghost: "text-text-muted hover:bg-surface-alt hover:text-text-primary disabled:text-text-placeholder disabled:cursor-not-allowed",
  danger: "bg-danger text-white hover:bg-danger-hover active:bg-danger-active disabled:bg-border-strong disabled:text-text-placeholder disabled:cursor-not-allowed",
} as const;

const BUTTON_SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
} as const;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-100",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {Icon && iconPosition === "left" ? (
        <Icon aria-hidden className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {Icon && iconPosition === "right" ? (
        <Icon aria-hidden className="h-4 w-4 shrink-0" />
      ) : null}
    </button>
  );
}

/* ── Interactive Chips & Selectable Tiles ───────────────────────────────── */

export function Chip({
  active,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        active
          ? "border-primary bg-primary-light font-medium text-primary"
          : "border-border bg-surface text-text-muted hover:border-border-strong hover:text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectTile({
  active,
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 p-3.5 text-center transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary-light/50 text-primary"
          : "border-border bg-surface hover:border-border-strong text-text-secondary hover:text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Bottom navigation ───────────────────────────────────────────────────── */

export function StepNav({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
      {children}
    </div>
  );
}

/* ── Feedback States ─────────────────────────────────────────────────────── */

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-alt p-8 text-sm text-text-muted"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border-strong border-t-primary" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-alt p-8 text-center text-sm text-text-muted">
      {Icon ? (
        <Icon aria-hidden className="h-5 w-5 text-text-placeholder" />
      ) : null}
      <div className="max-w-md">{children}</div>
    </div>
  );
}
