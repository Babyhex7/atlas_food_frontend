"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { searchFoodsPublic } from "@/internal/domain/food/services/foodService";
import { getFoodDetailPublic } from "@/internal/services/food.service";
import type { SearchFoodResult } from "@/internal/domain/food/types/food";

type AreaFoodPickerProps = {
  value: string | null;
  onChange: (foodId: string | null, foodName?: string) => void;
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
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(false);

  useEffect(() => {
    if (value) {
      let active = true;
      setLoadingName(true);
      getFoodDetailPublic(value)
        .then((food) => {
          if (active && food?.name) setSelectedName(food.name);
        })
        .catch(() => {
          if (active) setSelectedName(null);
        })
        .finally(() => {
          if (active) setLoadingName(false);
        });
      return () => {
        active = false;
      };
    } else {
      setSelectedName(null);
      setLoadingName(false);
    }
  }, [value]);

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
    const displayName = selectedName || (loadingName ? "Memuat nama makanan…" : "Makanan Tertaut");

    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-alt px-2.5 py-1.5 shadow-2xs">
        <span className="text-xs truncate text-text-primary font-medium flex items-center gap-1.5" title={displayName}>
          <span className="text-sm">🍽️</span>
          <span className="truncate">{displayName}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedName(null);
            onChange(null);
          }}
          className="btn btn-ghost btn-xs btn-icon shrink-0 text-text-muted hover:text-danger"
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
        placeholder="Tautkan ke Master Makanan (opsional)…"
        className="w-full text-xs px-2.5 py-1.5 rounded-md border border-border bg-surface text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition-fast"
      />

      {loading && <p className="text-[11px] text-text-muted mt-1 m-0">Mencari…</p>}

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-surface shadow-md p-1 list-none m-0">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedName(food.name);
                  onChange(food.id, food.name);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs hover:bg-surface-alt text-text-primary transition-fast"
              >
                <span className="font-semibold">{food.name}</span>
                {food.local_name && (
                  <span className="text-text-muted text-[11px]"> · {food.local_name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
