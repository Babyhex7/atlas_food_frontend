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
import { CategoryIcon } from "@/internal/domain/category/utils/categoryIcon";

// ── Nutrition card config ────────────────────────────────────────────────────
type NutrientConfig = {
  key: string;          // key di food.nutrients dari backend
  label: string;        // nama yang tampil di card
  unit: string;         // satuan fallback jika backend tidak mengirim unit
  isEnergy?: boolean;   // highlight khusus untuk energi
};

const NUTRIENT_CONFIG: NutrientConfig[] = [
  { key: "energy",           label: "Energi",         unit: "kkal", isEnergy: true },
  { key: "carbs",            label: "Karbohidrat",    unit: "g" },
  { key: "protein",          label: "Protein",        unit: "g" },
  { key: "fat",              label: "Lemak Total",    unit: "g" },
  { key: "saturated_fat",    label: "Lemak Jenuh",    unit: "g" },
  { key: "dietary_fiber",    label: "Serat Pangan",   unit: "g" },
  { key: "sugar",            label: "Gula",           unit: "g" },
  { key: "sodium",           label: "Natrium",        unit: "mg" },
  { key: "calcium",          label: "Kalsium",        unit: "mg" },
  { key: "iron",             label: "Zat Besi",       unit: "mg" },
  { key: "potassium",        label: "Kalium",         unit: "mg" },
  { key: "vitamin_a",        label: "Vitamin A",      unit: "µg" },
  { key: "vitamin_c",        label: "Vitamin C",      unit: "mg" },
  { key: "vitamin_d",        label: "Vitamin D",      unit: "µg" },
  { key: "cholesterol",      label: "Kolesterol",     unit: "mg" },
];

function NutritionCards({
  nutrients,
}: {
  nutrients?: Record<string, { value: number | null; unit: string }> | null;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {NUTRIENT_CONFIG.map((cfg) => {
        const nutrient = nutrients?.[cfg.key];
        const rawValue = nutrient?.value;
        const hasValue = rawValue !== null && rawValue !== undefined;
        const displayValue = hasValue ? String(rawValue) : "-";
        const displayUnit = hasValue ? (nutrient?.unit || cfg.unit) : "";

        return (
          <div
            key={cfg.key}
            className={cn(
              "flex flex-col justify-between p-4 rounded-xl border min-h-[88px]",
              cfg.isEnergy
                ? "border-primary-border bg-primary-light"
                : "border-border bg-white shadow-sm"
            )}
          >
            <p className="text-xs font-medium text-primary m-0 leading-snug">
              {cfg.label}
              {cfg.unit && (
                <span className="text-text-muted font-normal ml-1">({cfg.unit})</span>
              )}
            </p>
            <div className="mt-2">
              {hasValue ? (
                <span
                  className={cn(
                    "text-2xl font-bold font-mono leading-none",
                    cfg.isEnergy ? "text-primary" : "text-text-primary"
                  )}
                >
                  {displayValue}
                  {displayUnit && (
                    <span className="text-sm font-sans font-normal text-text-muted ml-[3px]">
                      {displayUnit}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-2xl font-normal font-mono leading-none text-text-muted">
                  -
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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

  const { data: rawFood, isLoading, error } = useQuery({
    queryKey: ["public-food-detail", foodId],
    queryFn: () => getFoodDetailPublic(foodId),
  });

  // ── MOCK: inject dummy portion_photos when backend returns empty ──────────
  const MOCK_PORTION_PHOTOS = [
    { id: "m1", label: "A", weight_gram: 50,  description: "1/4 porsi standar",  image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=50g",  thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=50g"  },
    { id: "m2", label: "B", weight_gram: 80,  description: "1/2 porsi kecil",    image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=80g",  thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=80g"  },
    { id: "m3", label: "C", weight_gram: 110, description: "Porsi anak",         image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=110g", thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=110g" },
    { id: "m4", label: "D", weight_gram: 140, description: "1 porsi standar URT",image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=140g", thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=140g" },
    { id: "m5", label: "E", weight_gram: 160, description: "Porsi sedang",       image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=160g", thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=160g" },
    { id: "m6", label: "F", weight_gram: 200, description: "Porsi dewasa",       image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=200g", thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=200g" },
    { id: "m7", label: "G", weight_gram: 230, description: "Porsi besar",        image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=230g", thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=230g" },
    { id: "m8", label: "H", weight_gram: 250, description: "Porsi ekstra",       image_url: "https://placehold.co/300x300/f5f5f5/aaa?text=250g", thumbnail_url: "https://placehold.co/150x150/f5f5f5/aaa?text=250g" },
  ];
  const food = rawFood
    ? {
        ...rawFood,
        photo_type: "series" as const,
        portion_photos:
          rawFood.portion_photos && rawFood.portion_photos.length > 0
            ? rawFood.portion_photos
            : MOCK_PORTION_PHOTOS,
      }
    : rawFood;
  // ── END MOCK ──────────────────────────────────────────────────────────────

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
            <div className="w-16 h-16 rounded-xl bg-white/15 border-[1.5px] border-white/25 flex items-center justify-center shrink-0">
              <CategoryIcon code={food.category?.code} name={food.category?.name} size={32} className="text-white" />
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

          <NutritionCards nutrients={food.nutrients} />

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
