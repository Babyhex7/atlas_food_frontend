"use client";

import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Info, Scale, Bookmark } from "lucide-react";
import { getFoodDetailPublic } from "@/internal/services/food.service";
import { isFoodBookmarked, toggleBookmarkedFood } from "@/internal/lib/cookies";
import { PortionPhotoViewer } from "@/internal/components/PortionPhotoViewer";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { cn } from "@/internal/lib/cn";
import { CollabSession, useCollab } from "@/internal/domain/collab";

function FoodDetailBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const foodId = params.id as string;
  const roomParam = searchParams.get("room");
  const { send, isConnected } = useCollab();

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
    if (!isConnected || !food) return;
    send("food_select", { food_id: food.id, food_name: food.name });
  }, [isConnected, food, send]);

  const handleSelectPhoto = (index: number) => {
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
              onClick={() =>
                router.push(roomParam ? `/find-food?room=${encodeURIComponent(roomParam)}` : "/find-food")
              }
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

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/15 border-[1.5px] border-white/25 flex items-center justify-center text-[2rem] shrink-0">
              {food.category?.icon || "🍽️"}
            </div>

            <div className="flex-1">
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="inline-flex items-center py-[2px] px-[10px] rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold font-mono">
                  {food.code}
                </span>
                <span className="inline-flex items-center py-[2px] px-[10px] rounded-full bg-white/15 border border-white/25 text-white text-xs font-medium">
                  {food.category?.name} ·{" "}
                  {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
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
      </div>

      <div className={cn(CONTAINER_CLASS, "-mt-8 relative z-10 flex-1 flex flex-col gap-5 pb-10")}>
        <div className="card animate-slide-up p-6">
          <div className="flex items-center gap-3 mb-5">
            <Scale size={22} className="text-primary" />
            <h2 className="text-xl font-semibold text-text-primary m-0">Album Foto Porsi</h2>
            {food.portion_photos && food.portion_photos.length > 0 && (
              <span className="badge badge-default ml-auto">
                {food.portion_photos.length} foto
              </span>
            )}
          </div>

          <PortionPhotoViewer
            photos={food.portion_photos || []}
            photoType={food.photo_type}
            activeIndex={activePhotoIndex}
            onSelect={handleSelectPhoto}
          />
        </div>

        <div className="card animate-slide-up p-6 [animation-delay:80ms]">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-primary" />
              <h2 className="text-lg font-semibold text-text-primary m-0">Kandungan Gizi</h2>
            </div>
            <span className="text-xs text-text-muted">per 100 gram</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(food.nutrients || {}).map(([key, nutrient]: [string, any]) => {
              const isEnergy = key === "energy";
              return (
                <div
                  key={key}
                  className={cn(
                    "p-4 rounded-xl text-center border",
                    isEnergy
                      ? "border-primary-border bg-primary-light"
                      : "border-border bg-surface-alt"
                  )}
                >
                  <div
                    className={cn(
                      "text-2xl font-bold font-mono leading-none mb-1",
                      isEnergy ? "text-primary" : "text-text-primary"
                    )}
                  >
                    {nutrient.value}
                    <span className="text-sm font-sans text-text-muted ml-[3px]">
                      {nutrient.unit}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-text-muted capitalize">
                    {key === "energy" ? "Kalori" : key}
                  </div>
                </div>
              );
            })}
          </div>

          {food.description && (
            <div className="mt-5 p-4 bg-surface-alt rounded-lg text-sm text-text-secondary leading-relaxed border border-border">
              {food.description}
            </div>
          )}
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
        <CollabSession roomPrefix="find-food" autoConnect={false}>
          <FoodDetailBody />
        </CollabSession>
      </Suspense>
    </div>
  );
}
