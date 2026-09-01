"use client";

/**
 * Primitif UI bersama untuk wizard recall.
 *
 * Semua utility Tailwind di sini memetakan ke design token di styles/globals.css
 * lewat jembatan di tailwind.config.js (bg-surface → var(--color-surface), dst),
 * jadi tampilannya tetap satu bahasa visual dengan halaman lain.
 *
 * Catatan skala: tailwind.config.js hanya mendefinisikan spacing 1,2,3,4,5,6,8,
 * 10,12,16. Nilai di luar itu ditulis sebagai arbitrary value agar tidak ada
 * class yang gagal resolve dan diam-diam kehilangan style.
 */

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import { ViewerLock } from "@/internal/domain/collab";

/* ── Shell & header ──────────────────────────────────────────────────────── */

/**
 * StepShell membungkus isi tiap langkah wizard.
 *
 * ViewerLock dipasang di sini — bukan di masing-masing step — supaya peserta
 * "Can view" terkunci total di seluruh langkah, termasuk langkah yang ditambahkan
 * nanti. Kalau digantung per komponen, cepat atau lambat ada kontrol baru yang
 * lupa dikunci. Di luar sesi kolaborasi ViewerLock meneruskan children apa adanya,
 * jadi wizard solo tidak terpengaruh sama sekali.
 */
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
      : "max-w-5xl lg:max-w-6xl";

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 transition-all duration-200",
        maxWClass,
        centered && "items-center text-center",
        className
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
    <header className={cn("flex flex-col gap-2", centered && "items-center text-center")}>
      <h2 className="text-xl font-bold leading-tight text-text-primary sm:text-2xl">{title}</h2>
      {subtitle ? (
        <p className="max-w-[38rem] text-sm leading-relaxed text-text-muted">{subtitle}</p>
      ) : null}
    </header>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */

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
        "rounded-xl border border-border bg-surface shadow-card",
        padded && "p-4 sm:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardLabel({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.07em] text-text-muted">
      {Icon ? <Icon aria-hidden className="h-4 w-4 text-primary" /> : null}
      {children}
    </div>
  );
}

/* ── Banner ──────────────────────────────────────────────────────────────── */

const BANNER_TONES = {
  info: "border-primary-border bg-primary-light text-primary",
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
        "flex gap-3 rounded-lg border p-3 text-xs leading-relaxed sm:p-4",
        BANNER_TONES[tone],
        className
      )}
    >
      {Icon ? <Icon aria-hidden className="mt-px h-4 w-4 shrink-0" /> : null}
      <div className="flex-1">
        {title ? <strong className="mb-1 block font-semibold">{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}

/* ── Button ──────────────────────────────────────────────────────────────── */

const BUTTON_VARIANTS = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md disabled:hover:bg-primary disabled:hover:shadow-sm",
  secondary:
    "border border-border bg-surface text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary",
  ghost: "text-text-muted hover:text-text-primary",
  danger: "bg-danger text-white hover:bg-danger-hover",
} as const;

const BUTTON_SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
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
      // Default "button": tanpa ini tombol di dalam form akan men-submit form.
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-45",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {Icon && iconPosition === "left" ? <Icon aria-hidden className="h-4 w-4 shrink-0" /> : null}
      {children}
      {Icon && iconPosition === "right" ? <Icon aria-hidden className="h-4 w-4 shrink-0" /> : null}
    </button>
  );
}

/* ── Chip ────────────────────────────────────────────────────────────────── */

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
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary-light font-semibold text-primary"
          : "border-border text-text-muted hover:border-primary-border hover:bg-primary-light hover:text-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Selectable tile (meal type, portion photo) ──────────────────────────── */

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
        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active
          ? "border-primary bg-primary-light shadow-sm"
          : "border-border bg-surface hover:border-primary-border hover:bg-primary-light",
        className
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
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
      {children}
    </div>
  );
}

/* ── States ──────────────────────────────────────────────────────────────── */

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-alt p-8 text-sm text-text-muted"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-primary" />
      {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-alt p-8 text-center text-sm text-text-muted">
      {Icon ? <Icon aria-hidden className="h-6 w-6 text-text-placeholder" /> : null}
      {children}
    </div>
  );
}
