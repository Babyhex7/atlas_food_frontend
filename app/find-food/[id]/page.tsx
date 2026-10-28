"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Info, Scale, Bookmark, Camera, LayoutGrid, Layers } from "lucide-react";
import { getFoodDetailPublic } from "@/internal/services/food.service";
import { isFoodBookmarked, toggleBookmarkedFood } from "@/internal/lib/cookies";
import { PortionPhotoViewer } from "@/internal/components/PortionPhotoViewer";
import { NutritionFactsCard } from "@/internal/domain/food/components/NutritionFactsCard";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { isGuideType, isRangeType } from "@/internal/lib/image";
import { useCollab, VIEWER_LOCK_CLASS, VIEWER_LOCK_HINT } from "@/internal/domain/collab";

function FoodDetailBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const foodId = params.id as string;
  const roomParam = searchParams.get("room");
  const inviteParam = searchParams.get("invite");
  const { send, isConnected, isViewer } = useCollab();

  const [isBookmarked, setIsBookmarked] = useState(() => isFoodBookmarked(foodId));
  const [trackedFoodId, setTrackedFoodId] = useState(foodId);
  if (foodId !== trackedFoodId) {
    setTrackedFoodId(foodId);
    setIsBookmarked(isFoodBookmarked(foodId));
  }
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const toggleBookmark = () => setIsBookmarked(toggleBookmarkedFood(foodId));

  const { data: food, isLoading, error } = useQuery({
    queryKey: ["public-food-detail", foodId],
    queryFn: () => getFoodDetailPublic(foodId),
  });

  useEffect(() => {
    // Viewer tidak menyiarkan makanan yang dibukanya
    if (!isConnected || !food || isViewer) return;
    send("food_select", { food_id: food.id, food_name: food.name });
  }, [isConnected, food, isViewer, send]);

  const handleSelectPhoto = (index: number) => {
    if (isViewer) return;
    setActivePhotoIndex(index);
    const photo = food?.portion_photos?.[index];
    if (isConnected && photo) {
      send("portion_set", {
        food_id: foodId,
        food_name: food?.name,
        portion_gram: photo.weight_gram,
        image_label: photo.label,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !food) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold text-text-primary">Makanan tidak ditemukan</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-primary bg-transparent border-none cursor-pointer font-sans"
        >
          ← Kembali ke pencarian
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-primary text-white pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(rgba(255,255,255,0.8)_1.5px,transparent_1.5px)] bg-[length:24px_24px]" />

        <div className={cn(CONTAINER_CLASS, "relative z-[1]")}>
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                if (roomParam) params.set("room", roomParam);
                if (inviteParam) params.set("invite", inviteParam);
                const qs = params.toString();
                router.push(qs ? `/find-food?${qs}` : "/find-food");
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 bg-transparent border-none cursor-pointer p-0 transition-fast font-sans hover:text-white"
            >
              <ArrowLeft size={16} /> Kembali
            </button>

            <button
              type="button"
              onClick={toggleBookmark}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium cursor-pointer transition-base font-sans hover:bg-white/25",
                isBookmarked
                  ? "border-[1.5px] border-white/60 bg-white/20"
                  : "border-[1.5px] border-white/30 bg-white/10"
              )}
            >
              <Bookmark size={15} className={isBookmarked ? "fill-white" : "fill-none"} />
              {isBookmarked ? "Tersimpan" : "Simpan"}
            </button>
          </div>

          <div>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center py-[2px] px-[10px] rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold font-mono">
                {food.code}
              </span>
              <span className="inline-flex items-center py-[2px] px-[10px] rounded-full bg-white/15 border border-white/25 text-white text-xs font-medium">
                {food.category?.name}
              </span>
              {/* Badge tipe foto: Series vs Range vs Guide */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 py-[2px] px-[10px] rounded-full border text-xs font-semibold",
                  isRangeType(food.photo_type)
                    ? "bg-emerald-400/25 border-emerald-300/40 text-emerald-100"
                    : isGuideType(food.photo_type)
                      ? "bg-amber-400/25 border-amber-300/40 text-amber-100"
                      : "bg-blue-400/20 border-blue-300/30 text-blue-100"
                )}
              >
                {isRangeType(food.photo_type) ? (
                  <><Layers size={11} /> Rentang Ukuran (Range)</>
                ) : isGuideType(food.photo_type) ? (
                  <><LayoutGrid size={11} /> Panduan Varian (Guide)</>
                ) : (
                  <><Camera size={11} /> Foto Seri (Series)</>
                )}
              </span>
            </div>

            <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white font-sans mb-1 mt-0 tracking-[-0.02em] leading-tight">
              {food.name}
            </h1>
            {food.local_name && (
              <p className="text-sm text-white/75 m-0 italic">{food.local_name}</p>
            )}
          </div>
        </div>
      </div>

      <div className={cn(CONTAINER_CLASS, "-mt-8 relative z-10 flex-1 pb-12")}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Foto Porsi & Deskripsi */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="card animate-slide-up p-5 md:p-6 shadow-xs border border-border bg-surface">
              <div className="flex items-center gap-3 mb-4">
                <Scale size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-text-primary m-0">Foto Porsi</h2>
                {food.portion_photos && food.portion_photos.length > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="badge badge-default">
                      {food.portion_photos.length} porsi
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider",
                        isRangeType(food.photo_type)
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isGuideType(food.photo_type)
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                      )}
                    >
                      {isRangeType(food.photo_type) ? "Range" : isGuideType(food.photo_type) ? "Guide" : "Series"}
                    </span>
                  </div>
                )}
              </div>

              {isViewer && (
                <p className="mb-4 mt-0 rounded-lg border border-warning-border bg-warning-light px-3 py-2 text-xs text-warning">
                  {VIEWER_LOCK_HINT}
                </p>
              )}

              <div className={cn(isViewer && VIEWER_LOCK_CLASS)}>
                <PortionPhotoViewer
                  photos={food.portion_photos || []}
                  photoType={food.photo_type}
                  foodId={foodId}
                  activeIndex={activePhotoIndex}
                  onSelect={handleSelectPhoto}
                />
              </div>
            </div>

            {food.description && (
              <div className="card p-5 border border-border bg-surface text-sm leading-relaxed">
                <h3 className="text-sm font-bold text-text-primary mb-1.5">Deskripsi Makanan</h3>
                <p className="m-0 text-text-secondary">{food.description}</p>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Kandungan Gizi (Sticky di Desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-6">
            <NutritionFactsCard
              nutrients={food.nutrients || {}}
              activePortionLabel={food.portion_photos?.[activePhotoIndex]?.label}
              activeWeightGram={food.portion_photos?.[activePhotoIndex]?.weight_gram}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function FoodDetailPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={36} className="animate-spin text-primary" />
          </div>
        }
      >
        {/* CollabSession ada di app/find-food/layout.tsx supaya tidak putus saat navigasi */}
        <FoodDetailBody />
      </Suspense>
    </div>
  );
}
