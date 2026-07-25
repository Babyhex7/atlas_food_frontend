"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useId } from "react";
import {
  AlertCircle,
  ArrowRight,
  CupSoda,
  Info,
  Loader2,
  Plus,
  Search,
  SearchX,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { searchFoodsPublic } from "@/internal/services/food.service";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";
import type { SearchFoodResult } from "@/internal/domain/food/types/food";
import type { RecallFood, MissingFood } from "../types/recall";
import { useCollab } from "@/internal/domain/collab";
import { Banner, Button, StepHeader, StepNav, StepShell } from "./ui/Primitives";
import { cn } from "@/internal/lib/cn";

/** Panjang minimum query — disamakan dengan validasi backend. */
const MIN_QUERY_LENGTH = 3;

interface Props {
  mealType: string;
  addedFoods: RecallFood[];
  onAddFood: (food: SearchFoodResult, type: "food" | "drink") => void;
  onRemoveFood: (foodId: string) => void;
  onAddMissing: (missing: MissingFood) => void;
  onContinue: () => void;
  onBack: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type SearchStatus = "idle" | "loading" | "success" | "error";

function FoodSearchBox({
  label,
  placeholder,
  foodType,
  addedIds,
  onAdd,
  onAddMissing,
}: {
  label: string;
  placeholder: string;
  foodType: "food" | "drink";
  addedIds: Set<string>;
  onAdd: (food: SearchFoodResult, type: "food" | "drink") => void;
  onAddMissing: (missing: MissingFood) => void;
}) {
  const [query, setQuery] = useState("");
  // Hasil disimpan bersama query asalnya. Dengan begitu seluruh state turunan
  // (loading, error, dropdown terbuka) bisa dihitung dari perbandingan query —
  // tidak perlu meng-“reset” state lewat efek, yang memicu cascading render.
  const [settled, setSettled] = useState<{
    query: string;
    results: SearchFoodResult[];
    error: string | null;
  } | null>(null);
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const debouncedQuery = useDebounce(query.trim(), 300);
  const { send, isConnected } = useCollab();

  const isSearchable = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const tooShort = debouncedQuery.length > 0 && !isSearchable;
  const isSettled = settled?.query === debouncedQuery;

  // Semua state tampilan diturunkan, bukan disinkronkan.
  const results = isSearchable && isSettled ? settled.results : [];
  const status: SearchStatus = !isSearchable
    ? "idle"
    : !isSettled
      ? "loading"
      : settled.error
        ? "error"
        : "success";
  const errorMessage = duplicateNotice ?? (isSearchable && isSettled ? settled.error : null);
  const open = isSearchable && dismissedQuery !== debouncedQuery;

  // Tutup dropdown saat klik di luar komponen.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setDismissedQuery(debouncedQuery);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [debouncedQuery]);

  // Pencarian ke API. Tidak ada setState sinkron di badan efek — state hanya
  // ditulis dari callback async saat respons benar-benar tiba.
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;

    if (isConnected) {
      send("food_search", { query: debouncedQuery, filters: { food_type: foodType } });
    }

    searchFoodsPublic(debouncedQuery, foodType, 10)
      .then((found) => {
        if (cancelled) return;
        // Normalisasi ulang di sisi konsumen: apa pun bentuk response, state ini
        // harus selalu array supaya render tidak pernah menyentuh null.
        setSettled({
          query: debouncedQuery,
          results: Array.isArray(found) ? found : [],
          error: null,
        });
        setHighlight(0);
      })
      .catch((e) => {
        if (cancelled) return;
        // Error dimunculkan ke UI. Sebelumnya kegagalan (mis. token kedaluwarsa
        // atau backend mati) ditelan diam-diam sehingga search terlihat "rusak".
        setSettled({
          query: debouncedQuery,
          results: [],
          error: getApiErrorMessage(e, "Pencarian gagal. Periksa koneksi Anda."),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, foodType, isConnected, send]);

  const resetSearch = useCallback(() => {
    setQuery("");
    setSettled(null);
    setDismissedQuery(null);
    setDuplicateNotice(null);
  }, []);

  const handleSelect = useCallback(
    (food: SearchFoodResult) => {
      if (addedIds.has(food.id)) {
        setDuplicateNotice(`"${food.name}" sudah ada di daftar.`);
        return;
      }
      // Backend mengirim food_type; kalau tidak ada, pakai jenis kotak pencarian.
      onAdd(food, food.food_type ?? foodType);
      if (isConnected) {
        send("food_select", { food_id: food.id, food_name: food.name });
        send("meal_add", { meal_type: foodType, food_id: food.id, food_name: food.name });
      }
      resetSearch();
      inputRef.current?.focus();
    },
    [addedIds, onAdd, foodType, isConnected, send, resetSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setDismissedQuery(debouncedQuery);
      return;
    }
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = results[highlight];
      if (picked) handleSelect(picked);
    }
  };

  const showMissingHint = status === "success" && results.length === 0;
  const TypeIcon = foodType === "drink" ? CupSoda : UtensilsCrossed;

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <label
        htmlFor={`${listboxId}-input`}
        className="text-xs font-semibold uppercase tracking-[0.07em] text-text-muted"
      >
        {label}
      </label>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
          <input
            id={`${listboxId}-input`}
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-sm text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-primary focus:shadow-focus"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDuplicateNotice(null);
              setDismissedQuery(null);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setDismissedQuery(null)}
          />
          {status === "loading" ? (
            <Loader2
              aria-hidden
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary"
            />
          ) : null}
        </div>

        <Button
          icon={Plus}
          onClick={() => results[0] && handleSelect(results[0])}
          disabled={results.length === 0}
          aria-label={`Tambah hasil teratas ke daftar`}
        >
          Tambah
        </Button>
      </div>

      {/* Petunjuk & error selalu terlihat — inilah yang dulu hilang sehingga
          pencarian terasa tidak berfungsi padahal hanya kurang karakter. */}
      {tooShort ? (
        <p className="text-xs text-text-muted">
          Ketik minimal {MIN_QUERY_LENGTH} karakter untuk mulai mencari.
        </p>
      ) : null}

      {errorMessage ? (
        <p role="alert" className="flex items-center gap-2 text-xs text-danger">
          <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
          {errorMessage}
        </p>
      ) : null}

      {/* Dropdown hasil */}
      {open && (status === "success" || status === "loading") ? (
        <div className="relative">
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-1 z-dropdown overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
          >
            {status === "loading" && results.length === 0 ? (
              <p className="px-4 py-3 text-xs text-text-muted">Mencari…</p>
            ) : null}

            {results.map((food, i) => {
              const already = addedIds.has(food.id);
              return (
                <button
                  key={food.id}
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  disabled={already}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => handleSelect(food)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-sm transition-colors last:border-b-0",
                    already
                      ? "cursor-not-allowed text-text-disabled"
                      : "text-text-secondary hover:bg-primary-light hover:text-primary",
                    i === highlight && !already && "bg-primary-light text-primary"
                  )}
                >
                  <TypeIcon aria-hidden className="h-4 w-4 shrink-0" />
                  <span className="flex-1 font-medium">{food.name}</span>
                  {food.local_name ? (
                    <span className="text-xs text-text-muted">{food.local_name}</span>
                  ) : null}
                  {already ? (
                    <span className="text-xs font-semibold">Sudah ditambahkan</span>
                  ) : food.category ? (
                    <span className="rounded-full bg-surface-alt px-2 py-px text-xs text-text-muted">
                      {food.category.name}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {showMissingHint ? (
              <div className="flex flex-wrap items-center gap-2 bg-surface-alt px-4 py-3 text-xs text-text-muted">
                <SearchX aria-hidden className="h-4 w-4 shrink-0" />
                <span>Tidak ketemu?</span>
                <button
                  type="button"
                  className="font-semibold text-primary hover:underline"
                  onClick={() => {
                    onAddMissing({ name: debouncedQuery });
                    resetSearch();
                  }}
                >
                  Catat &quot;{debouncedQuery}&quot; secara manual
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Step2AddFood({
  mealType,
  addedFoods,
  onAddFood,
  onRemoveFood,
  onAddMissing,
  onContinue,
  onBack,
}: Props) {
  const canContinue = addedFoods.length > 0;
  const addedIds = useMemo(() => new Set(addedFoods.map((f) => f.food.id)), [addedFoods]);

  return (
    <StepShell>
      <StepHeader
        title={`Apa yang Anda konsumsi saat ${mealType}?`}
        subtitle="Cari dan tambahkan semua makanan serta minuman yang Anda konsumsi."
      />

      <Banner icon={Info}>
        Catat setiap komponen secara terpisah. Misalnya untuk Nasi Goreng, masukkan juga
        pelengkapnya seperti telur, kerupuk, atau timun agar perhitungan gizinya lebih akurat.
      </Banner>

      <FoodSearchBox
        label="Tambah makanan"
        placeholder="Cari makanan (mis. Nasi Goreng, Ayam Goreng, Bubur Ayam…)"
        foodType="food"
        addedIds={addedIds}
        onAdd={onAddFood}
        onAddMissing={onAddMissing}
      />

      <FoodSearchBox
        label="Tambah minuman"
        placeholder="Cari minuman (mis. Es Teh, Kopi Susu, Jus Jeruk…)"
        foodType="drink"
        addedIds={addedIds}
        onAdd={onAddFood}
        onAddMissing={onAddMissing}
      />

      {/* ── Daftar item ────────────────────────────────────────────────── */}
      {addedFoods.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-alt px-4 py-3">
            <span className="text-sm font-semibold text-text-secondary">Item yang ditambahkan</span>
            <span className="rounded-full bg-border px-2 py-px text-xs font-medium text-text-muted">
              {addedFoods.length} item
            </span>
          </div>

          <div className="flex gap-2 border-b border-primary-border bg-primary-light px-4 py-2 text-xs text-primary">
            <Info aria-hidden className="mt-px h-4 w-4 shrink-0" />
            Ukuran porsi dan bahan tambahan akan diatur pada langkah berikutnya.
          </div>

          <ul>
            {addedFoods.map((rf) => {
              const ItemIcon = rf.food_type === "drink" ? CupSoda : UtensilsCrossed;
              return (
                <li
                  key={rf.food.id}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <ItemIcon aria-hidden className="h-4 w-4 shrink-0 text-text-muted" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-text-primary">
                      {rf.food.name}
                    </span>
                    {rf.food.local_name ? (
                      <span className="truncate text-xs text-text-muted">{rf.food.local_name}</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFood(rf.food.id)}
                    aria-label={`Hapus ${rf.food.name}`}
                    className="rounded-md p-1 text-text-muted transition-colors hover:bg-danger-light hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <StepNav>
        <Button variant="ghost" onClick={onBack}>
          Kembali
        </Button>
        <Button icon={ArrowRight} iconPosition="right" onClick={onContinue} disabled={!canContinue}>
          Lanjut
        </Button>
      </StepNav>
    </StepShell>
  );
}
