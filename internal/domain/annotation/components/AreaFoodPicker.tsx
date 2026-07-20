"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { searchFoodsPublic } from "@/internal/domain/food/services/foodService";
import type { SearchFoodResult } from "@/internal/domain/food/types/food";

type AreaFoodPickerProps = {
  value: string | null;
  onChange: (foodId: string | null) => void;
};

/**
 * Tautkan area ke food master (opsional, brief §5.2 poin 7).
 *
 * Memakai endpoint pencarian publik yang sama dengan Find Food, supaya
 * anotasi tidak pernah menunjuk food yang tidak bisa dibuka responden.
 */
export function AreaFoodPicker({ value, onChange }: AreaFoodPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchFoodResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    // Batalkan hasil yang datang terlambat agar tidak menimpa query terbaru
    let active = true;

    if (trimmed.length < 2) {
      // Pembersihan dijadwalkan, bukan dipanggil langsung di badan effect,
      // agar tidak memicu render bertingkat.
      const clear = setTimeout(() => {
        if (active) {
          setResults([]);
          setLoading(false);
        }
      }, 0);

      return () => {
        active = false;
        clearTimeout(clear);
      };
    }

    const timer = setTimeout(() => {
      if (!active) return;
      setLoading(true);

      searchFoodsPublic(trimmed, "", 8)
        .then((items) => {
          if (active) setResults(items ?? []);
        })
        .catch(() => {
          if (active) setResults([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface-alt px-2 py-1.5">
        <span className="text-xs font-mono truncate text-text-muted" title={value}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="btn btn-ghost btn-xs btn-icon shrink-0"
          title="Lepas tautan food"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cari food master (opsional)…"
        className="w-full text-xs"
      />

      {loading && <p className="text-xs text-text-muted mt-1">Mencari…</p>}

      {results.length > 0 && (
        <ul className="mt-1 max-h-40 overflow-y-auto rounded-sm border border-border bg-surface">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(food.id);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-surface-alt"
              >
                <span className="font-medium">{food.name}</span>
                {food.local_name && (
                  <span className="text-text-muted"> · {food.local_name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
