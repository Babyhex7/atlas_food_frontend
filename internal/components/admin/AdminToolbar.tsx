"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/internal/lib/cn";

/**
 * Baris kontrol daftar: pencarian di kiri, saringan menyusul.
 *
 * Satu komponen untuk semua daftar admin — sebelumnya tiap daftar menulis
 * markup input dan select sendiri, jadi tinggi, radius, dan jarak antar kontrol
 * berbeda di tiap halaman.
 */
export function AdminToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center gap-2.5">{children}</div>;
}

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
};

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  label,
  className,
}: SearchProps) {
  return (
    <div className={cn("relative min-w-[200px] flex-1 sm:max-w-xs", className)}>
      <Search
        size={14}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        value={value}
        aria-label={label}
        placeholder={placeholder ?? label}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border-[1.5px] border-border bg-surface pl-8 pr-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:shadow-focus"
      />
    </div>
  );
}

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
};

/** Select dengan label menyatu ("Status: Semua") supaya maksudnya jelas tanpa label terpisah. */
export function AdminSelect({ value, onChange, label, options, className }: SelectProps) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-10 cursor-pointer rounded-lg border-[1.5px] border-border bg-surface px-3 font-sans text-sm text-text-primary outline-none transition-base focus:border-primary focus:shadow-focus",
        className
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {label}: {option.label}
        </option>
      ))}
    </select>
  );
}
