"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import {
  ArrowRight,
  Check,
  CupSoda,
  Info,
  Loader2,
  Plus,
  Search,
  SearchX,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { searchFoodsPublic } from "@/internal/services/food.service";
import { getPublicAssociatedFoods } from "@/internal/domain/food/services/foodService";
import type { FoodSearchResult } from "@/internal/types/food.types";
import type { RecallFood, AdditionalItem } from "../types/recall";
import { getImageUrl } from "@/internal/lib/image";
import {
  Banner,
  Button,
  Card,
  Chip,
  EmptyState,
  StepHeader,
  StepNav,
  StepShell,
} from "./ui/Primitives";
import { cn } from "@/internal/lib/cn";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface AdditionalSearchProps {
  foodName: string;
  onSelect: (item: {
    food_id?: string;
    name: string;
    unit: string;
    amount_value: number;
    source?: "recommendation" | "search" | "custom";
  }) => void;
}

function AdditionalSearchBox({ foodName, onSelect }: AdditionalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownId = useId();

  const debouncedQuery = useDebounce(query.trim(), 280);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      searchFoodsPublic(debouncedQuery, "", 12, "additional")
        .then((data) => {
          if (!isCancelled) {
            setResults(data);
            setIsOpen(true);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setResults([]);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [debouncedQuery]);

  // Tutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChoose = (food: FoodSearchResult) => {
    onSelect({
      food_id: food.id,
      name: food.name,
      unit: "porsi",
      amount_value: 1,
      source: "search",
    });
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    if (!query.trim()) return;
    onSelect({
      name: query.trim(),
      unit: "porsi",
      amount_value: 1,
      source: "custom",
    });
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={`Cari pelengkap atau bumbu untuk ${foodName} (misal: sambal, minyak, kecap, kerupuk)...`}
          aria-label={`Cari pelengkap untuk ${foodName}`}
          aria-controls={dropdownId}
          className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-9 text-xs sm:text-sm text-text-primary placeholder:text-text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {loading ? (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-primary" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 rounded-full p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary"
            aria-label="Bersihkan pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown Pencarian */}
      {isOpen && query.trim().length >= 2 && (
        <div
          id={dropdownId}
          className="absolute z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Mencari pelengkap...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="flex flex-col gap-0.5">
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => handleChoose(food)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors hover:bg-surface-alt active:bg-primary-light"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {food.thumbnail_url || food.image_url ? (
                        <img
                          src={getImageUrl(food.thumbnail_url || food.image_url)}
                          alt=""
                          className="h-8 w-8 rounded-md object-cover border border-border shrink-0 bg-surface-alt"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-alt text-text-muted">
                          <UtensilsCrossed className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-text-primary truncate">{food.name}</span>
                        {food.local_name && food.local_name !== food.name ? (
                          <span className="text-xs text-text-muted truncate">{food.local_name}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {food.category?.name ? (
                        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-medium text-text-muted">
                          {food.category.name}
                        </span>
                      ) : null}
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4 px-3 text-center">
              <SearchX className="h-6 w-6 text-text-muted" />
              <p className="text-xs text-text-muted">
                Tidak ada makanan cocok dengan <span className="font-semibold text-text-primary">&ldquo;{query}&rdquo;</span>.
              </p>
              <button
                type="button"
                onClick={handleAddCustom}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambahkan &ldquo;{query}&rdquo; sebagai pelengkap kustom
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface Props {
  foods: RecallFood[];
  onSetAdditionals: (foodId: string, additionals: AdditionalItem[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step4Additional({ foods, onSetAdditionals, onContinue, onBack }: Props) {
  const [foodAdditionals, setFoodAdditionals] = useState<Record<string, AdditionalItem[]>>(() =>
    Object.fromEntries(foods.map((f) => [f.food.id, f.additionals ?? []]))
  );

  // Makanan terkait (associated foods) dinamis per makanan dari konfigurasi admin
  const [dynamicAssociated, setDynamicAssociated] = useState<
    Record<
      string,
      { food_id?: string; name: string; unit: string; defaultVal: number; isDefault?: boolean }[]
    >
  >({});

  useEffect(() => {
    let isMounted = true;
    for (const rf of foods) {
      const foodId = rf.food.id;
      if (!dynamicAssociated[foodId]) {
        getPublicAssociatedFoods(foodId)
          .then((res) => {
            if (!isMounted) return;
            if (res && res.length > 0) {
              const mapped = res.map((item) => ({
                food_id: item.associated_food_id,
                name: item.associated_food?.name || item.associated_food_id,
                unit: "sdm",
                defaultVal: 1,
                isDefault: item.is_default,
              }));
              setDynamicAssociated((prev) => ({ ...prev, [foodId]: mapped }));
            }
          })
          .catch(() => {
            // Abaikan error / fallback ke default
          });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [foods, dynamicAssociated]);

  const addOrUpdateItem = useCallback(
    (
      foodId: string,
      item: {
        food_id?: string;
        name: string;
        unit: string;
        amount_value: number;
        source?: "recommendation" | "search" | "custom";
      }
    ) => {
      setFoodAdditionals((prev) => {
        const existing = prev[foodId] ?? [];
        if (existing.some((a) => a.name.toLowerCase() === item.name.toLowerCase())) {
          return prev;
        }
        const isSearch = item.source === "search" || item.source === "custom";
        const nextItems: AdditionalItem[] = [
          ...existing,
          {
            food_id: item.food_id,
            name: item.name,
            amount: isSearch ? "Secukupnya" : `${item.amount_value} ${item.unit}`,
            amount_value: item.amount_value,
            unit: item.unit,
            source: item.source ?? "recommendation",
          },
        ];
        onSetAdditionals(foodId, nextItems);
        return {
          ...prev,
          [foodId]: nextItems,
        };
      });
    },
    [onSetAdditionals]
  );

  const updateAmount = (foodId: string, name: string, value: string) => {
    const parsed = Number.parseFloat(value);
    const numVal = Number.isFinite(parsed) && parsed > 0 ? Math.min(50, Math.max(0.5, parsed)) : 1;
    setFoodAdditionals((prev) => {
      const nextItems = (prev[foodId] ?? []).map((a) =>
        a.name === name ? { ...a, amount_value: numVal, amount: `${numVal} ${a.unit}` } : a
      );
      onSetAdditionals(foodId, nextItems);
      return {
        ...prev,
        [foodId]: nextItems,
      };
    });
  };

  const updateUnit = (foodId: string, name: string, newUnit: string) => {
    setFoodAdditionals((prev) => {
      const nextItems = (prev[foodId] ?? []).map((a) =>
        a.name === name ? { ...a, unit: newUnit, amount: `${a.amount_value} ${newUnit}` } : a
      );
      onSetAdditionals(foodId, nextItems);
      return {
        ...prev,
        [foodId]: nextItems,
      };
    });
  };

  const removeItem = (foodId: string, name: string) => {
    setFoodAdditionals((prev) => {
      const nextItems = (prev[foodId] ?? []).filter((a) => a.name !== name);
      onSetAdditionals(foodId, nextItems);
      return {
        ...prev,
        [foodId]: nextItems,
      };
    });
  };

  /** Simpan seluruh bahan tambahan ke session sebelum berpindah langkah */
  const persist = () => {
    foods.forEach((f) => onSetAdditionals(f.food.id, foodAdditionals[f.food.id] ?? []));
  };

  const handleContinue = () => {
    persist();
    onContinue();
  };

  const handleBack = () => {
    persist();
    onBack();
  };

  if (foods.length === 0) {
    return (
      <StepShell>
        <StepHeader title="Detail Tambahan & Pelengkap" />
        <EmptyState>Belum ada makanan pada sesi makan ini.</EmptyState>
        <StepNav>
          <Button variant="secondary" onClick={onBack}>
            Kembali
          </Button>
          <Button icon={ArrowRight} iconPosition="right" onClick={onContinue}>
            Lanjut
          </Button>
        </StepNav>
      </StepShell>
    );
  }

  return (
    <StepShell>
      <StepHeader
        title="Detail Tambahan & Pelengkap"
        subtitle="Tambahkan bumbu cocol, sambal, minyak penggorengan, atau kerupuk yang Anda konsumsi bersama makanan di bawah. (Opsional namun dianjurkan untuk keakuratan asupan gizi)"
      />

      <Banner icon={Info} tone="info">
        <strong>Tips Ahli Gizi:</strong> Makanan seperti ikan goreng sering menyerap minyak (~1 sdm),
        serta kerap dinikmati dengan sambal cocol atau perasan jeruk nipis. Melaporkan pelengkap membantu
        perhitungan kalori & zat gizi menjadi lebih tepat.
      </Banner>

      <div className="flex flex-col gap-6">
        {foods.map((rf) => {
          const items = foodAdditionals[rf.food.id] ?? [];
          const ItemIcon = rf.food_type === "drink" ? CupSoda : UtensilsCrossed;

          return (
            <Card key={rf.food.id} className="relative overflow-visible">
              {/* Header Makanan Utama */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
                <div className="flex items-center gap-3">
                  {rf.portion?.image_url || rf.food.thumbnail_url || rf.food.image_url ? (
                    <img
                      src={getImageUrl(rf.portion?.image_url || rf.food.thumbnail_url || rf.food.image_url)}
                      alt=""
                      className="h-11 w-11 rounded-lg object-cover border border-border shrink-0 bg-surface-alt"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-alt text-text-muted">
                      <ItemIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-text-primary leading-snug">{rf.food.name}</h2>
                    <p className="text-xs text-text-muted">
                      {rf.food.category?.name ? `${rf.food.category.name} • ` : ""}
                      Makanan Utama
                    </p>
                  </div>
                </div>

                {rf.portion ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-semibold text-text-primary">
                    <span>Porsi:</span>
                    <span className="font-mono text-primary font-bold">{rf.portion.portion_gram}g</span>
                  </span>
                ) : null}
              </div>

              {/* Search Bar Makanan Tambahan Terpadu */}
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <span>Cari Makanan Pelengkap / Bumbu:</span>
                </label>
                <AdditionalSearchBox
                  foodName={rf.food.name}
                  onSelect={(item) => addOrUpdateItem(rf.food.id, item)}
                />
              </div>

              {/* Rekomendasi Cepat (Quick Chips) */}
              {dynamicAssociated[rf.food.id] && dynamicAssociated[rf.food.id].length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Rekomendasi Cepat:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dynamicAssociated[rf.food.id].map((condiment) => {
                      const isAdded = items.some(
                        (fa) =>
                          (condiment.food_id && fa.food_id === condiment.food_id) ||
                          fa.name.toLowerCase() === condiment.name.toLowerCase()
                      );
                      return (
                        <Chip
                          key={condiment.food_id || condiment.name}
                          active={isAdded}
                          onClick={() =>
                            isAdded
                              ? removeItem(rf.food.id, condiment.name)
                              : addOrUpdateItem(rf.food.id, {
                                food_id: condiment.food_id,
                                name: condiment.name,
                                unit: condiment.unit || "sdm",
                                amount_value: condiment.defaultVal || 1,
                                source: "recommendation",
                              })
                          }
                        >
                          {isAdded ? (
                            <Check aria-hidden className="h-3 w-3 text-white" />
                          ) : (
                            <Plus aria-hidden className="h-3 w-3" />
                          )}
                          <span>{condiment.name}</span>
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Daftar Pelengkap yang Sudah Ditambahkan */}
              {items.length > 0 ? (
                <div className="mt-5 border-t border-border pt-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Pelengkap yang Dipakai ({items.length})
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Rekomendasi dapat disesuaikan takarannya
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {items.map((item) => {
                      const isFromSearch =
                        item.source === "search" ||
                        item.source === "custom" ||
                        !dynamicAssociated[rf.food.id]?.some(
                          (c) =>
                            (c.food_id && c.food_id === item.food_id) ||
                            c.name.toLowerCase() === item.name.toLowerCase()
                        );

                      return (
                        <li
                          key={item.name}
                          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-alt/50 p-2.5 sm:px-3.5 sm:py-2.5 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-sm font-semibold text-text-primary truncate">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isFromSearch ? (
                              <span className="rounded-md bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-muted border border-border/60">
                                Ditambahkan
                              </span>
                            ) : (
                              <>
                                {/* Stepper Jumlah Cepat [-] [ 1 ] [+] */}
                                <div className="flex items-center rounded-lg border border-border bg-surface shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = item.amount_value || 1;
                                      const nextVal = Math.max(0.5, current <= 1 ? current - 0.5 : current - 1);
                                      updateAmount(rf.food.id, item.name, String(nextVal));
                                    }}
                                    aria-label={`Kurangi ${item.name}`}
                                    className="flex h-8 w-7 items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary rounded-l-lg transition-colors font-bold text-sm"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min={0.5}
                                    max={50}
                                    step={0.5}
                                    inputMode="decimal"
                                    value={item.amount_value || 1}
                                    onChange={(e) => updateAmount(rf.food.id, item.name, e.target.value)}
                                    aria-label={`Jumlah ${item.name}`}
                                    className="h-8 w-12 border-x border-border bg-transparent text-center font-mono text-xs font-semibold text-text-primary focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = item.amount_value || 1;
                                      const nextVal = Math.min(50, current + (current < 1 ? 0.5 : 1));
                                      updateAmount(rf.food.id, item.name, String(nextVal));
                                    }}
                                    aria-label={`Tambah ${item.name}`}
                                    className="flex h-8 w-7 items-center justify-center text-text-muted hover:bg-surface-alt hover:text-text-primary rounded-r-lg transition-colors font-bold text-sm"
                                  >
                                    +
                                  </button>
                                </div>

                                <span className="text-xs font-semibold text-text-secondary min-w-[28px]">
                                  {item.unit || "sdm"}
                                </span>
                              </>
                            )}

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onClick={() => removeItem(rf.food.id, item.name)}
                              aria-label={`Hapus ${item.name}`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-danger-light hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border/80 bg-surface-alt/30 p-3.5 text-center text-xs text-text-muted">
                  Belum ada bumbu atau pelengkap yang ditambahkan untuk makanan ini.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <StepNav>
        <Button variant="secondary" onClick={handleBack}>
          Kembali ke Porsi
        </Button>
        <Button icon={ArrowRight} iconPosition="right" onClick={handleContinue}>
          Lanjut ke Tinjau
        </Button>
      </StepNav>
    </StepShell>
  );
}
