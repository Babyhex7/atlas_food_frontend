"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Info, Scale, Bookmark } from "lucide-react";
import { getFoodDetailPublic } from "@/internal/services/food.service";
import { isFoodBookmarked, toggleBookmarkedFood } from "@/internal/lib/cookies";
import { PortionPhotoViewer } from "@/internal/components/PortionPhotoViewer";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

export default function FoodDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const foodId  = params.id as string;

  const [isBookmarked,    setIsBookmarked]    = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => { setIsBookmarked(isFoodBookmarked(foodId)); }, [foodId]);
  const toggleBookmark = () => setIsBookmarked(toggleBookmarkedFood(foodId));

  const { data: food, isLoading, error } = useQuery({
    queryKey: ["public-food-detail", foodId],
    queryFn: () => getFoodDetailPublic(foodId),
  });

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
        <AppHeader />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !food) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
        <AppHeader />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)" }}>
            Makanan tidak ditemukan
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ fontSize: "var(--text-sm)", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}
          >
            ← Kembali ke pencarian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column", paddingBottom: "var(--space-10)" }}>
      <AppHeader />

      {/* ── Hero banner ── */}
      <div
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          paddingTop: "var(--space-8)",
          paddingBottom: "var(--space-16)",
          paddingLeft: "var(--space-4)",
          paddingRight: "var(--space-4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* dot pattern */}
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px", pointerEvents: "none",
          }}
        />

        <div className={CONTAINER_CLASS} style={{ position: "relative", zIndex: 1 }}>
          {/* Top row: back + bookmark */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
                fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)",
                color: "rgba(255,255,255,0.8)", background: "none", border: "none",
                cursor: "pointer", padding: 0, transition: "var(--transition-fast)",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              <ArrowLeft size={16} /> Kembali
            </button>

            <button
              type="button"
              onClick={toggleBookmark}
              style={{
                display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-full)",
                border: isBookmarked ? "1.5px solid rgba(255,255,255,0.6)" : "1.5px solid rgba(255,255,255,0.3)",
                backgroundColor: isBookmarked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)",
                cursor: "pointer", transition: "var(--transition-base)",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isBookmarked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"; }}
            >
              <Bookmark size={15} style={{ fill: isBookmarked ? "white" : "none" }} />
              {isBookmarked ? "Tersimpan" : "Simpan"}
            </button>
          </div>

          {/* Food info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4)" }}>
            {/* Icon */}
            <div
              style={{
                width: 64, height: 64, borderRadius: "var(--radius-xl)",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", flexShrink: 0,
              }}
            >
              {food.category?.icon || "🍽️"}
            </div>

            <div style={{ flex: 1 }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "2px 10px", borderRadius: "var(--radius-full)",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                    fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {food.code}
                </span>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "2px 10px", borderRadius: "var(--radius-full)",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white",
                    fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)",
                  }}
                >
                  {food.category?.name} · {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: "var(--weight-bold)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                  margin: "0 0 var(--space-1)",
                  letterSpacing: "-0.02em",
                  lineHeight: "var(--leading-tight)",
                }}
              >
                {food.name}
              </h1>
              {food.local_name && (
                <p style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.75)", margin: 0, fontStyle: "italic" }}>
                  {food.local_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ── */}
      <div
        className={CONTAINER_CLASS}
        style={{ marginTop: "calc(-1 * var(--space-8))", position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
      >

        {/* Album foto porsi */}
        <div className="card animate-slide-up" style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
            <Scale size={22} style={{ color: "var(--color-primary)" }} />
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
              Album Foto Porsi
            </h2>
            {food.portion_photos && food.portion_photos.length > 0 && (
              <span className="badge badge-default" style={{ marginLeft: "auto" }}>
                {food.portion_photos.length} foto
              </span>
            )}
          </div>

          <PortionPhotoViewer
            photos={food.portion_photos || []}
            photoType={food.photo_type}
            activeIndex={activePhotoIndex}
            onSelect={setActivePhotoIndex}
          />
        </div>

        {/* Kandungan gizi */}
        <div className="card animate-slide-up" style={{ padding: "var(--space-6)", animationDelay: "80ms" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)", flexWrap: "wrap", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Info size={18} style={{ color: "var(--color-primary)" }} />
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
                Kandungan Gizi
              </h2>
            </div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>per 100 gram</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--space-3)" }}>
            {Object.entries(food.nutrients || {}).map(([key, nutrient]: [string, any]) => {
              const isEnergy = key === "energy";
              return (
                <div
                  key={key}
                  style={{
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-xl)",
                    border: `1px solid ${isEnergy ? "var(--color-primary-border)" : "var(--color-border)"}`,
                    backgroundColor: isEnergy ? "var(--color-primary-light)" : "var(--color-surface-alt)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--text-2xl)",
                      fontWeight: "var(--weight-bold)",
                      fontFamily: "var(--font-mono)",
                      color: isEnergy ? "var(--color-primary)" : "var(--color-text-primary)",
                      lineHeight: 1,
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {nutrient.value}
                    <span style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", marginLeft: 3 }}>
                      {nutrient.unit}
                    </span>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                    {key === "energy" ? "Kalori" : key}
                  </div>
                </div>
              );
            })}
          </div>

          {food.description && (
            <div
              style={{
                marginTop: "var(--space-5)",
                padding: "var(--space-4)",
                backgroundColor: "var(--color-surface-alt)",
                borderRadius: "var(--radius-lg)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-relaxed)",
                border: "1px solid var(--color-border)",
              }}
            >
              {food.description}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
