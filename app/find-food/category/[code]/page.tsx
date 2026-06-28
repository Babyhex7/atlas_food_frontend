"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { getFoodsByCategoryPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

export default function CategoryFoodsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryCode = params.code as string;

  // Optimistic/Fallback category name lookup
  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  const { data: foodsResponse, isLoading } = useQuery({
    queryKey: ["public-category-foods", categoryCode],
    queryFn: () => getFoodsByCategoryPublic(categoryCode),
  });

  const foods = foodsResponse?.foods || [];

  const category = categories.find((c: any) => c.code === categoryCode);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="bg-primary-900 text-white pt-8 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#C2E5CF 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
        <div className={`${CONTAINER_CLASS} relative z-10`}>
          <button onClick={() => router.back()} className="inline-flex items-center text-primary-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-5xl">{category?.icon || "🍽️"}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                {category ? category.name : categoryCode}
              </h1>
              <p className="text-primary-200 mt-2">Menampilkan semua makanan dalam kategori ini.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${CONTAINER_CLASS} -mt-10 relative z-20 pb-20 flex-1`}>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 animate-fade-in">
          <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
            <span>Daftar Makanan</span>
            <span className="text-sm font-normal text-muted-foreground bg-muted-foreground/10 px-3 py-1 rounded-full">
              {foods.length} hasil
            </span>
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🍽️</div>
              <p className="text-muted-foreground">Belum ada makanan di kategori ini.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {foods.map((food: any) => (
                <Link
                    key={food.id}
                    href={`/find-food/${food.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group bg-white"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {food.category?.icon || category?.icon || "🍲"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{food.name}</h3>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-2">
                        <span className="bg-muted-foreground/10 px-2 py-0.5 rounded font-mono">
                          {food.code}
                        </span>
                        {food.photo_type && (
                          <span className="text-accent-600">
                            • {food.photo_type === 'series' ? 'Porsi Ukuran' : 'Porsi Komparasi'}
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
      </div>
    </div>
  );
}
