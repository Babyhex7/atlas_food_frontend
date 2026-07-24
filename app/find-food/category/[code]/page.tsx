"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { getFoodsByCategoryPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { CategoryIcon } from "@/internal/domain/category/utils/categoryIcon";

export default function CategoryFoodsPage() {
  const params   = useParams();
  const router   = useRouter();
  const categoryCode = params.code as string;

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  const { data: foodsResponse, isLoading } = useQuery({
    queryKey: ["public-category-foods", categoryCode],
    queryFn: () => getFoodsByCategoryPublic(categoryCode),
  });

  const foods    = foodsResponse?.foods || [];
  const category = categories.find((c: any) => c.code === categoryCode);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <AppHeader />

      {/* ── Hero banner ── */}
      <div className="bg-primary text-white pt-8 pb-16 px-4 relative overflow-hidden">
        {/* dot pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px]" />
        <div className={cn(CONTAINER_CLASS, "relative z-[1]")}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 bg-transparent border-none cursor-pointer mb-6 p-0 transition-fast hover:text-white"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          {/* Category info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/15 border-[1.5px] border-white/25 flex items-center justify-center shrink-0">
              <CategoryIcon code={category?.code} name={category?.name ?? categoryCode} size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white font-sans m-0 mb-1 tracking-[-0.02em]">
                {category ? category.name : categoryCode}
              </h1>
              <p className="text-sm text-white/75 m-0">
                Menampilkan semua makanan dalam kategori ini.
              </p>
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
            <span className="badge badge-default">{foods.length} hasil</span>
          </div>

          {/* States */}
          {isLoading && (
            <div className="flex justify-center p-12">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          )}

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

          {!isLoading && foods.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              {foods.map((food: any) => (
                <Link
                  key={food.id}
                  href={`/find-food/${food.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-border bg-surface no-underline transition-base hover:border-primary-border hover:shadow-md hover:-translate-y-px"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-xl shrink-0">
                    <CategoryIcon
                      code={food.category?.code ?? categoryCode}
                      name={food.category?.name ?? category?.name}
                      size={22}
                      className="text-primary"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary mb-1 mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {food.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold bg-surface-alt text-text-muted py-[1px] px-2 rounded-sm border border-border">
                        {food.code}
                      </span>
                      {food.photo_type && (
                        <span className="text-xs text-primary">
                          · {food.photo_type === "series" ? "Porsi Ukuran" : "Porsi Komparasi"}
                        </span>
                      )}
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
