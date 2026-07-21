"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LayoutGrid, List } from "lucide-react";
import { getFoodsByCategoryPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { FoodPhotoCard } from "@/internal/components/FoodPhotoCard";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { isGuideType } from "@/internal/lib/image";

type ViewMode = "grid" | "list";

export default function CategoryFoodsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryCode = params.code as string;
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  // Backend GET /public/categories/:code/foods → {status, data: FoodSearchResult[], count}
  // food.service.ts sudah return data.data → langsung array
  const { data: foods = [], isLoading } = useQuery<FoodSearchResult[]>({
    queryKey: ["public-category-foods", categoryCode],
    queryFn: () => getFoodsByCategoryPublic(categoryCode),
  });

  const category = categories.find((c: { code: string }) => c.code === categoryCode);

  // Hitung berapa series vs guide
  const seriesCount = foods.filter((f) => !isGuideType(f.photo_type)).length;
  const guideCount = foods.filter((f) => isGuideType(f.photo_type)).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      {/* ── Hero banner ── */}
      <div className="bg-primary text-white pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px]" />
        <div className={cn(CONTAINER_CLASS, "relative z-[1]")}>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 bg-transparent border-none cursor-pointer mb-6 p-0 transition-fast hover:text-white"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/15 border-[1.5px] border-white/25 flex items-center justify-center shrink-0">
              <CategoryIcon code={category?.code} name={category?.name ?? categoryCode} size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white font-sans m-0 mb-1 tracking-[-0.02em]">
                {category ? category.name : categoryCode}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-white/75 m-0">
                  Foto porsi makanan per kategori
                </p>
                {!isLoading && foods.length > 0 && (
                  <div className="flex gap-2">
                    {seriesCount > 0 && (
                      <span className="text-[11px] font-semibold bg-white/15 border border-white/25 text-white px-2 py-[2px] rounded-full">
                        {seriesCount} Series
                      </span>
                    )}
                    {guideCount > 0 && (
                      <span className="text-[11px] font-semibold bg-amber-400/30 border border-amber-300/40 text-white px-2 py-[2px] rounded-full">
                        {guideCount} Guide
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ── */}
      <div className={cn(CONTAINER_CLASS, "-mt-8 relative z-10 pb-16 flex-1")}>
        <div className="card animate-fade-in p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-text-primary m-0">
              Daftar Makanan
            </h2>
            <div className="flex items-center gap-3">
              <span className="badge badge-default">{foods.length} makanan</span>
              {/* Toggle tampilan grid/list */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-muted hover:bg-surface-alt"
                  )}
                  aria-label="Tampilan grid"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-muted hover:bg-surface-alt"
                  )}
                  aria-label="Tampilan list"
                  aria-pressed={viewMode === "list"}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center p-12">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && foods.length === 0 && (
            <div className="text-center p-12">
              <div className="flex justify-center mb-3">
                <CategoryIcon code={categoryCode} name={category?.name} size={40} className="text-text-muted" />
              </div>
              <p className="text-sm text-text-muted m-0">
                Belum ada makanan di kategori ini.
              </p>
            </div>
          )}

          {/* Grid view — FoodPhotoCard */}
          {!isLoading && foods.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {foods.map((food) => (
                <FoodPhotoCard key={food.id} food={food} />
              ))}
            </div>
          )}

          {/* List view — compact row */}
          {!isLoading && foods.length > 0 && viewMode === "list" && (
            <div className="flex flex-col gap-2">
              {foods.map((food) => (
                <Link
                  key={food.id}
                  href={`/find-food/${food.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-border bg-surface no-underline transition-base hover:border-primary-border hover:shadow-md hover:-translate-y-px"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {food.category?.icon
                      ? <span>{food.category.icon}</span>
                      : <span className="text-primary text-sm font-bold">{food.code.split("-")[0]}</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary mb-1 mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {food.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold bg-surface-alt text-text-muted py-[1px] px-2 rounded-sm border border-border">
                        {food.code}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider",
                          isGuideType(food.photo_type)
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        )}
                      >
                        {isGuideType(food.photo_type) ? "Guide" : "Series"}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-text-muted shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
