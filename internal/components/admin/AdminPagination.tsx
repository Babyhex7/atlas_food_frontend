"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/internal/lib/cn";

type Props = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Kata benda yang dihitung, mis. "makanan" → "1–20 dari 48 makanan". */
  unit: string;
};

/** Daftar nomor halaman dengan elipsis: 1 … 4 5 6 … 12 */
function pageNumbers(current: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

export function AdminPagination({ page, limit, total, onPageChange, unit }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  // Satu halaman = tidak ada yang perlu dinavigasi, tapi rentangnya tetap
  // berguna sebagai konfirmasi jumlah data.
  if (totalPages <= 1) {
    return (
      <p className="mt-5 m-0 text-xs text-text-muted">
        Menampilkan {total} {unit}
      </p>
    );
  }

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-5 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="m-0 text-xs text-text-muted tabular-nums">
        {first}–{last} dari {total} {unit}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-border bg-surface text-text-secondary transition-fast hover:border-primary-border hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          <ChevronLeft size={15} aria-hidden />
        </button>

        {pageNumbers(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-md border-[1.5px] px-2 font-sans text-xs font-semibold tabular-nums transition-fast",
                item === page
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-secondary hover:border-primary-border hover:text-primary"
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-[1.5px] border-border bg-surface text-text-secondary transition-fast hover:border-primary-border hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-secondary"
        >
          <ChevronRight size={15} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
