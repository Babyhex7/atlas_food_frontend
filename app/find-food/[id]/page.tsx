"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Info, Scale, Bookmark } from "lucide-react";
import { getFoodDetailPublic } from "@/internal/services/food.service";
import { isFoodBookmarked, toggleBookmarkedFood } from "@/internal/lib/cookies";
import { PortionPhotoViewer } from "@/internal/components/PortionPhotoViewer";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

export default function FoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const foodId = params.id as string;
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(isFoodBookmarked(foodId));
  }, [foodId]);

  const toggleBookmark = () => {
    setIsBookmarked(toggleBookmarkedFood(foodId));
  };

  const { data: food, isLoading, error } = useQuery({
    queryKey: ["public-food-detail", foodId],
    queryFn: () => getFoodDetailPublic(foodId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-foreground">Makanan tidak ditemukan</h2>
          <button onClick={() => router.back()} className="mt-4 text-primary hover:underline">
            Kembali ke pencarian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <AppHeader />
      <div className="bg-primary-900 text-white pt-8 pb-20 px-4 relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#C2E5CF 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
        <div className={`${CONTAINER_CLASS} relative z-10`}>
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => router.back()} className="inline-flex items-center text-primary-200 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </button>
            <button 
              onClick={toggleBookmark}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                isBookmarked 
                  ? "bg-accent text-accent-900 border-accent hover:bg-accent-600 hover:text-white" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "Tersimpan" : "Simpan"}
            </button>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/20">
              {food.category?.icon || "🍽️"}
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-primary-100 mb-3 font-mono">
                {food.code}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-primary-100 mb-3 ml-2">
                {food.category?.name} · {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {food.name}
              </h1>
              {food.local_name && (
                <p className="text-primary-200 italic">{food.local_name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`${CONTAINER_CLASS} -mt-10 relative z-20 space-y-6 flex-1`}>
        
        {/* Main Focus: Portion Guide */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 animate-slide-in">
          <div className="flex items-center gap-2 mb-6">
            <Scale className="w-6 h-6 text-accent-600" />
            <h2 className="text-2xl font-semibold">Album Foto Porsi</h2>
          </div>
          
          {/* Interactive Photo Viewer */}
          <PortionPhotoViewer 
            photos={food.portion_photos || []} 
            photoType={food.photo_type || 'series'} 
          />

          {/* Portion Table */}
          {food.portion_photos && food.portion_photos.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-medium text-foreground mb-4">Tabel Ukuran Porsi</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground font-medium">
                    <tr>
                      <th className="px-4 py-3 border-b border-border">Kode</th>
                      <th className="px-4 py-3 border-b border-border text-right">Berat (g)</th>
                      <th className="px-4 py-3 border-b border-border">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {food.portion_photos.map((photo) => (
                      <tr key={photo.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{photo.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-primary">{photo.weight_gram} g</td>
                        <td className="px-4 py-3 text-muted-foreground">{photo.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Nutrition Info */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Kandungan Gizi <span className="text-sm font-normal text-muted-foreground ml-auto">(per 100 gram)</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(food.nutrients || {}).map(([key, nutrient]) => {
              // Highlight calories/energy
              const isEnergy = key === "energy";
              return (
                <div key={key} className={`p-4 rounded-xl border ${isEnergy ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'} text-center`}>
                  <div className={`text-2xl font-bold ${isEnergy ? 'text-primary' : 'text-foreground'} font-mono`}>
                    {nutrient.value}
                    <span className="text-sm ml-1 text-muted-foreground font-sans">{nutrient.unit}</span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mt-1 capitalize">
                    {key === "energy" ? "Kalori" : key}
                  </div>
                </div>
              );
            })}
          </div>
          
          {food.description && (
            <div className="mt-6 p-4 bg-muted/30 rounded-xl text-sm text-foreground leading-relaxed">
              {food.description}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
