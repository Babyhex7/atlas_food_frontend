"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Search, Trash2, Utensils } from "lucide-react";
import { Button } from "@/internal/pkg/components/Button";
import { useAdminAssociatedFoods, useSetAdminAssociatedFoods } from "../hooks/useFoodQueries";
import { searchFoodsPublic } from "../services/foodService";
import type { AssociatedFood, SearchFoodResult } from "../types/food";

type AssociatedFoodsSectionProps = {
  foodId: string;
};

type ItemState = {
  associated_food_id: string;
  name: string;
  code: string;
  categoryName?: string;
  priority: number;
  is_default: boolean;
};

export function AssociatedFoodsSection({ foodId }: AssociatedFoodsSectionProps) {
  const { data: serverItems, isLoading, error: queryError } = useAdminAssociatedFoods(foodId);
  const setMutation = useSetAdminAssociatedFoods(foodId);

  const [items, setItems] = useState<ItemState[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchFoodResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  const currentKey = serverItems ? `${foodId}-${serverItems.map((s) => s.associated_food_id).join(",")}` : null;

  if (serverItems && syncedKey !== currentKey && !hasChanges) {
    setSyncedKey(currentKey);
    const mapped: ItemState[] = serverItems.map((item, index) => ({
      associated_food_id: item.associated_food_id,
      name: item.associated_food?.name || item.associated_food_id,
      code: item.associated_food?.code || "",
      categoryName: item.associated_food?.category?.name,
      priority: item.priority || index + 1,
      is_default: item.is_default || false,
    }));
    setItems(mapped);
  }

  // Click outside search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchFoodsPublic(q, "", 10);
        if (!isMounted) return;
        // Exclude current food and already added foods
        const filtered = (res || []).filter(
          (f) => f.id !== foodId && !items.some((it) => it.associated_food_id === f.id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Gagal mencari makanan untuk associated food:", err);
      } finally {
        if (isMounted) setSearchLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, foodId, items]);

  const handleAdd = (food: SearchFoodResult) => {
    const nextPriority = items.length > 0 ? Math.max(...items.map((it) => it.priority)) + 1 : 1;
    const newItem: ItemState = {
      associated_food_id: food.id,
      name: food.name,
      code: food.code,
      categoryName: food.category?.name,
      priority: nextPriority,
      is_default: false,
    };
    setItems((prev) => [...prev, newItem]);
    setHasChanges(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    setSaveSuccess(false);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.associated_food_id !== id));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleToggleDefault = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.associated_food_id === id ? { ...it, is_default: !it.is_default } : it
      )
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Re-assign sequential priorities
    const updated = copy.map((it, idx) => ({ ...it, priority: idx + 1 }));
    setItems(updated);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      await setMutation.mutateAsync({
        items: items.map((it, idx) => ({
          associated_food_id: it.associated_food_id,
          priority: idx + 1,
          is_default: it.is_default,
        })),
      });
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Gagal menyimpan associated foods:", err);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-2xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            Makanan Pendamping & Pelengkap Cepat (Associated Foods)
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Atur makanan pendamping atau pelengkap yang otomatis muncul sebagai tombol cepat (quick chips) pada Step 4 survei recall responden.
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <Check className="h-3.5 w-3.5" /> Tersimpan
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={setMutation.isPending}
            disabled={!hasChanges && !setMutation.isPending}
          >
            Simpan Pelengkap
          </Button>
        </div>
      </div>

      {/* Input Pencarian Makanan Tambahan */}
      <div ref={searchContainerRef} className="relative mt-4">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setSearchOpen(true);
            }}
            placeholder="Cari makanan pelengkap dari master (misal: sambal, susu, telur goreng, kerupuk)..."
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-xs sm:text-sm text-text-primary placeholder:text-text-placeholder transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3.5 h-4 w-4 animate-spin text-primary" />
          )}
        </div>

        {/* Dropdown Hasil Pencarian */}
        {searchOpen && searchQuery.trim().length >= 2 && (
          <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5">
            {searchLoading && searchResults.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-5 text-xs text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Mencari di master makanan...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {searchResults.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(f)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs sm:text-sm transition-colors hover:bg-surface-alt"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-text-primary truncate">{f.name}</span>
                        <span className="text-[11px] font-mono text-text-muted truncate">
                          {f.code} {f.local_name ? `• ${f.local_name}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {f.category?.name && (
                          <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-text-muted">
                            {f.category.name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2 py-1 text-xs font-semibold text-primary">
                          <Plus className="h-3 w-3" /> Tambah
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : !searchLoading ? (
              <div className="py-4 text-center text-xs text-text-muted">
                Tidak ada makanan cocok dengan &ldquo;{searchQuery}&rdquo;
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Tabel / Daftar Pelengkap yang Dikaitkan */}
      <div className="mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Memuat konfigurasi makanan terkait...</span>
          </div>
        ) : queryError ? (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-xs text-danger">
            Gagal memuat data makanan terkait.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-7 text-center">
            <p className="text-xs text-text-muted">
              Belum ada pelengkap khusus yang dikonfigurasi untuk makanan ini.
            </p>
            <p className="mt-1 text-[11px] text-text-placeholder">
              Responden akan melihat tombol rekomendasi pelengkap umum (Sambal, Kecap Manis, Bawang Goreng, Kerupuk, Acar, Saus Tomat).
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-surface-alt/60 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="py-2.5 pl-3.5 pr-2 w-14 text-center">Urutan</th>
                  <th className="py-2.5 px-3">Nama Makanan Terkait</th>
                  <th className="py-2.5 px-3 w-36">Kategori</th>
                  <th className="py-2.5 px-3 w-28 text-center">Default Dipilih</th>
                  <th className="py-2.5 pr-3.5 pl-2 w-16 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {items.map((it, index) => (
                  <tr key={it.associated_food_id} className="hover:bg-surface-alt/40 transition-colors">
                    <td className="py-2 pl-3.5 pr-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, "up")}
                          aria-label="Naikkan urutan"
                          className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => handleMove(index, "down")}
                          aria-label="Turunkan urutan"
                          className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-text-primary">{it.name}</div>
                      {it.code && <div className="font-mono text-[10px] text-text-muted">{it.code}</div>}
                    </td>
                    <td className="py-2 px-3 text-text-secondary text-xs">
                      {it.categoryName || "-"}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={it.is_default}
                        onChange={() => handleToggleDefault(it.associated_food_id)}
                        aria-label={`Centang default untuk ${it.name}`}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 pr-3.5 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(it.associated_food_id)}
                        aria-label={`Hapus ${it.name}`}
                        className="rounded p-1.5 text-text-muted hover:bg-danger-light hover:text-danger transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
