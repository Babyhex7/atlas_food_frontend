"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Loader2, UtensilsCrossed } from "lucide-react";
import { searchFoodsPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { useDebounce } from "@/internal/hooks/use-debounce";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

export function FindFoodContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const canSearch = debouncedSearch.trim().length >= 2;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["public-search", debouncedSearch],
    queryFn: () => searchFoodsPublic(debouncedSearch.trim()),
    enabled: canSearch,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="bg-primary-900 text-white pt-10 pb-24 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#C2E5CF 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className={`${CONTAINER_CLASS} relative z-10 text-center space-y-6`}>
          <h1 className="text-4xl md:text-5xl font-display font-bold">Find Your Food</h1>
          <p className="text-primary-100 max-w-2xl mx-auto text-lg">
            Temukan estimasi ukuran porsi dan kandungan gizi lengkap dari makanan Indonesia.
          </p>
          <div className="relative max-w-2xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-4 ring-primary-800 focus:ring-primary-400 bg-white text-primary-900 text-lg placeholder:text-muted focus:outline-none transition-all shadow-lg"
              placeholder="Cari makanan (nama / kode, misal: Nasi, MP-01...)"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${CONTAINER_CLASS} -mt-10 relative z-20 pb-20 flex-1`}>
        {debouncedSearch.trim().length > 0 && debouncedSearch.trim().length < 2 && (
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 text-center text-muted-foreground">
            Ketik minimal 2 karakter untuk mencari...
          </div>
        )}

        {debouncedSearch.trim().length === 0 && (
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              Kategori Makanan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: { id: string; code: string; name: string; icon?: string }) => (
                <Link
                  key={cat.id}
                  href={`/find-food/category/${cat.code}`}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {cat.icon || "🍽️"}
                  </div>
                  <h3 className="font-medium text-sm text-foreground">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {canSearch && (
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
              <span>Hasil Pencarian: &quot;{debouncedSearch}&quot;</span>
              <span className="text-sm font-normal text-muted-foreground bg-muted-foreground/10 px-3 py-1 rounded-full">
                {searchResults.length} hasil
              </span>
            </h2>
            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground">Makanan tidak ditemukan</h3>
                <p className="text-muted-foreground mt-1">Coba gunakan kata kunci lain.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {searchResults.map((food: FoodSearchResult) => (
                  <Link
                    key={food.id}
                    href={`/find-food/${food.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group bg-white"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {food.category?.icon || "🍲"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{food.name}</h3>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-2">
                        <span className="bg-muted-foreground/10 px-2 py-0.5 rounded font-mono">
                          {food.code}
                        </span>
                        <span className="bg-muted-foreground/10 px-2 py-0.5 rounded">
                          {food.category?.name}
                        </span>
                        {food.photo_type && (
                          <span className="text-accent-600">
                            • {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
