"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { Plus, ChevronRight, UtensilsCrossed, Search } from "lucide-react";
import { useAdminFoods } from "../hooks/useFoodQueries";
import { useAdminCategories } from "@/internal/domain/category/hooks/useCategoryQueries";

/**
 * Daftar makanan admin + search/filter (kategori, tipe foto, status).
 */
export function FoodList() {
  const router = useRouter();
  const { data: categories } = useAdminCategories();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [photoType, setPhotoType] = useState("");
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useAdminFoods({
    limit: 100,
    page: 1,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(category ? { category } : {}),
    ...(photoType ? { photo_type: photoType } : {}),
    ...(isActive ? { is_active: isActive } : {}),
  });
  const foods = data?.foods ?? [];
  const total = data?.pagination?.total ?? foods.length;
  const hasFilter = Boolean(debouncedSearch || category || photoType || isActive);

  return (
    <div className="p-6 px-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Makanan</h1>
          <p className="text-sm text-text-muted m-0">
            {isLoading ? "Memuat…" : `${total} makanan ditemukan`}
          </p>
        </div>
        <Button onClick={() => router.push("/admin/foods/new")}>
          <Plus size={15} /> Tambah Makanan
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kode, atau nama lokal…"
            className="w-full h-11 pl-9 pr-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans focus:border-primary focus:shadow-focus"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-11 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans focus:border-primary"
        >
          <option value="">Semua kategori</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={photoType}
            onChange={(e) => setPhotoType(e.target.value)}
            className="h-11 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans focus:border-primary"
          >
            <option value="">Semua tipe</option>
            <option value="series">Series</option>
            <option value="range">Range</option>
          </select>
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value as "" | "true" | "false")}
            className="h-11 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans focus:border-primary"
          >
            <option value="">Semua status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gagal memuat daftar makanan"}
          </span>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted m-0">Memuat makanan…</p>
      ) : foods.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={40} className="text-text-muted" />}
          title={hasFilter ? "Tidak ada hasil" : "Belum ada makanan"}
          description={
            hasFilter
              ? "Coba ubah kata kunci atau filter."
              : "Tambahkan makanan ke database Atlas Food."
          }
          action={
            !hasFilter ? (
              <Button onClick={() => router.push("/admin/foods/new")}>
                <Plus size={14} /> Tambah Makanan
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {foods.map((food) => (
            <Link
              key={food.id}
              href={`/admin/foods/${food.id}`}
              className="flex items-center gap-4 py-4 px-5 rounded-xl border-[1.5px] border-border bg-surface no-underline transition-base hover:border-primary-border hover:shadow-sm hover:-translate-y-px"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-xl shrink-0">
                {food.category?.icon || "🍽️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  {food.name}
                </p>
                <p className="text-xs text-text-muted m-0 font-mono">
                  {food.code}
                  {food.category?.name ? ` · ${food.category.name}` : ""}
                  {food.photo_type ? ` · ${food.photo_type}` : ""}
                  {food.is_active === false ? " · nonaktif" : ""}
                </p>
              </div>
              <ChevronRight size={16} className="text-text-muted shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
