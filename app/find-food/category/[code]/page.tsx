"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronRight } from "lucide-react";
import { getFoodsByCategoryPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

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
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
              fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)",
              color: "rgba(255,255,255,0.8)", background: "none", border: "none",
              cursor: "pointer", marginBottom: "var(--space-6)", padding: 0,
              transition: "var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          {/* Category info */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <div
              style={{
                width: 64, height: 64,
                borderRadius: "var(--radius-xl)",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", flexShrink: 0,
              }}
            >
              {category?.icon || "🍽️"}
            </div>
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontWeight: "var(--weight-bold)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                  margin: "0 0 var(--space-1)",
                  letterSpacing: "-0.02em",
                }}
              >
                {category ? category.name : categoryCode}
              </h1>
              <p style={{ fontSize: "var(--text-sm)", color: "rgba(255,255,255,0.75)", margin: 0 }}>
                Menampilkan semua makanan dalam kategori ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ── */}
      <div
        className={CONTAINER_CLASS}
        style={{ marginTop: "calc(-1 * var(--space-8))", position: "relative", zIndex: 10, paddingBottom: "var(--space-16)", flex: 1 }}
      >
        <div className="card animate-fade-in" style={{ padding: "var(--space-6)" }}>
          {/* Header row */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "var(--space-5)", flexWrap: "wrap", gap: "var(--space-2)",
            }}
          >
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
              Daftar Makanan
            </h2>
            <span className="badge badge-default">{foods.length} hasil</span>
          </div>

          {/* States */}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--color-primary)" }} />
            </div>
          )}

          {!isLoading && foods.length === 0 && (
            <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>🍽️</div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
                Belum ada makanan di kategori ini.
              </p>
            </div>
          )}

          {!isLoading && foods.length > 0 && (
            <div className="grid md:grid-cols-2" style={{ gap: "var(--space-3)" }}>
              {foods.map((food: any) => (
                <Link
                  key={food.id}
                  href={`/find-food/${food.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "var(--space-4)",
                    padding: "var(--space-4)", borderRadius: "var(--radius-xl)",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    textDecoration: "none", transition: "var(--transition-base)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-primary-border)";
                    el.style.boxShadow = "var(--shadow-md)";
                    el.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-border)";
                    el.style.boxShadow = "none";
                    el.style.transform = "none";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--color-primary-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", flexShrink: 0,
                    }}
                  >
                    {food.category?.icon || category?.icon || "🍲"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text-primary)", margin: "0 0 var(--space-1)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                    >
                      {food.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span
                        style={{
                          fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)",
                          fontWeight: "var(--weight-semibold)",
                          backgroundColor: "var(--color-surface-alt)",
                          color: "var(--color-text-muted)",
                          padding: "1px var(--space-2)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {food.code}
                      </span>
                      {food.photo_type && (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)" }}>
                          · {food.photo_type === "series" ? "Porsi Ukuran" : "Porsi Komparasi"}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
