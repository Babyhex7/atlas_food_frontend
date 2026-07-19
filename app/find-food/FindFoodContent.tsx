"use client";

import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Loader2, UtensilsCrossed } from "lucide-react";
import { searchFoodsPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { useDebounce } from "@/internal/hooks/use-debounce";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { CollabSession, useCollab } from "@/internal/domain/collab";

function FindFoodBody() {
  const searchParams = useSearchParams();
  const { send, isConnected } = useCollab();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);
  const [prevQuery, setPrevQuery] = useState(queryFromUrl);
  if (queryFromUrl !== prevQuery) {
    setPrevQuery(queryFromUrl);
    setSearchTerm(queryFromUrl);
  }
  const debouncedSearch = useDebounce(searchTerm, 300);
  const canSearch = debouncedSearch.trim().length >= 2;
  const roomParam = searchParams.get("room");

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["public-search", debouncedSearch],
    queryFn: () => searchFoodsPublic(debouncedSearch.trim()),
    enabled: canSearch,
  });

  useEffect(() => {
    if (!isConnected || !canSearch) return;
    send("food_search", { query: debouncedSearch.trim(), filters: {} });
  }, [debouncedSearch, canSearch, isConnected, send]);

  return (
    <>

      {/* ── Hero banner ── */}
      <div className="bg-primary text-white pt-10 pb-16 px-4 relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px]" />

        <div className={cn(CONTAINER_CLASS, "relative z-[1] text-center")}>
          <h1 className="text-[clamp(1.875rem,5vw,2.75rem)] font-bold font-sans text-white mb-3 mt-0 tracking-[-0.025em]">
            Find Your Food
          </h1>
          <p className="text-white/85 text-base mx-auto mb-8 max-w-[480px] leading-relaxed">
            Temukan estimasi ukuran porsi dan kandungan gizi lengkap dari makanan Indonesia.
          </p>

          {/* Search bar */}
          <div className="relative max-w-[600px] mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
              <Search size={18} className="text-text-muted" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari makanan (nama / kode, misal: Nasi, MP-01…)"
              className="shadow-xl-focus-ring block w-full pl-12 pr-12 py-4 rounded-xl border-none bg-surface text-text-primary text-base outline-none shadow-xl transition-base font-sans box-border"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                <Loader2 size={18} className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ── */}
      <div className={cn(CONTAINER_CLASS, "-mt-8 relative z-10 pb-16 flex-1")}>

        {/* Minimum chars hint */}
        {debouncedSearch.trim().length > 0 && debouncedSearch.trim().length < 2 && (
          <div className="card p-6 text-center text-text-muted text-sm">
            Ketik minimal 2 karakter untuk mencari…
          </div>
        )}

        {/* Category browse */}
        {debouncedSearch.trim().length === 0 && (
          <div className="card animate-fade-in p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-5 mt-0 flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-primary" />
              Kategori Makanan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat: { id: string; code: string; name: string; icon?: string }) => (
                <Link
                  key={cat.id}
                  href={`/find-food/category/${cat.code}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] border-border no-underline text-center transition-base bg-surface hover:border-primary-border hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="text-[2rem] leading-none">
                    {cat.icon
                      ? <span>{cat.icon}</span>
                      : <UtensilsCrossed size={30} className="text-primary" />
                    }
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {canSearch && (
          <div className="card animate-fade-in p-6">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-text-primary m-0">
                Hasil: &ldquo;{debouncedSearch}&rdquo;
              </h2>
              <span className="badge badge-default">
                {searchResults.length} hasil
              </span>
            </div>

            {/* Empty */}
            {searchResults.length === 0 && !isSearching && (
              <div className="text-center py-12 px-4">
                <div className="flex justify-center mb-4">
                  <Search size={48} className="text-text-muted" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2 mt-0">
                  Makanan tidak ditemukan
                </h3>
                <p className="text-sm text-text-muted m-0">
                  Coba gunakan kata kunci lain.
                </p>
              </div>
            )}

            {/* Results grid */}
            {searchResults.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {searchResults.map((food: FoodSearchResult) => (
                  <Link
                    key={food.id}
                    href={
                      roomParam
                        ? `/find-food/${food.id}?room=${encodeURIComponent(roomParam)}`
                        : `/find-food/${food.id}`
                    }
                    onClick={() => {
                      if (isConnected) {
                        send("food_select", {
                          food_id: food.id,
                          food_name: food.name,
                        });
                      }
                    }}
                    className="flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-border no-underline bg-surface transition-base hover:border-primary-border hover:shadow-md hover:-translate-y-px"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                      {food.category?.icon
                        ? <span className="text-xl">{food.category.icon}</span>
                        : <UtensilsCrossed size={20} className="text-primary" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary mb-1 mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        {food.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold bg-surface-alt text-text-muted py-[1px] px-2 rounded-sm border border-border">
                          {food.code}
                        </span>
                        {food.category?.name && (
                          <span className="badge badge-default">{food.category.name}</span>
                        )}
                        {food.photo_type && (
                          <span className="text-xs text-primary">
                            · {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-text-muted shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function FindFoodContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <Suspense fallback={null}>
        <CollabSession roomPrefix="find-food" autoConnect={false}>
          <FindFoodBody />
        </CollabSession>
      </Suspense>
    </div>
  );
}
