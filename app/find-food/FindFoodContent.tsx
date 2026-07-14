"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Loader2, UtensilsCrossed } from "lucide-react";
import { searchFoodsPublic, getCategoriesPublic } from "@/internal/services/food.service";
import { useDebounce } from "@/internal/hooks/use-debounce";
import type { FoodSearchResult } from "@/internal/types/food.types";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";

export function FindFoodContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const canSearch = debouncedSearch.trim().length >= 2;

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: getCategoriesPublic,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["public-search", debouncedSearch],
    queryFn: () => searchFoodsPublic(debouncedSearch.trim()),
    enabled: canSearch,
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)" }}>
      <AppHeader />

      {/* ── Hero banner ── */}
      <div
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          paddingTop: "var(--space-10)",
          paddingBottom: "var(--space-16)",
          paddingLeft: "var(--space-4)",
          paddingRight: "var(--space-4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle dot pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            pointerEvents: "none",
          }}
        />

        <div className={CONTAINER_CLASS} style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(1.875rem, 5vw, 2.75rem)",
              fontWeight: "var(--weight-bold)",
              fontFamily: "var(--font-sans)",
              color: "white",
              margin: "0 0 var(--space-3)",
              letterSpacing: "-0.025em",
            }}
          >
            Find Your Food
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "var(--text-base)",
              margin: "0 auto var(--space-8)",
              maxWidth: 480,
              lineHeight: "var(--leading-relaxed)",
            }}
          >
            Temukan estimasi ukuran porsi dan kandungan gizi lengkap dari makanan Indonesia.
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
            <div
              style={{
                position: "absolute",
                left: "var(--space-4)",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search size={18} style={{ color: "var(--color-text-muted)" }} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari makanan (nama / kode, misal: Nasi, MP-01…)"
              style={{
                display: "block",
                width: "100%",
                paddingLeft: "3rem",
                paddingRight: "3rem",
                paddingTop: "var(--space-4)",
                paddingBottom: "var(--space-4)",
                borderRadius: "var(--radius-xl)",
                border: "none",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontSize: "var(--text-base)",
                outline: "none",
                boxShadow: "var(--shadow-xl)",
                transition: "var(--transition-base)",
                fontFamily: "var(--font-sans)",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-xl), var(--focus-ring)"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-xl)"; }}
            />
            {isSearching && (
              <div
                style={{
                  position: "absolute",
                  right: "var(--space-4)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Loader2 size={18} className="animate-spin" style={{ color: "var(--color-primary)" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ── */}
      <div
        className={CONTAINER_CLASS}
        style={{ marginTop: "calc(-1 * var(--space-8))", position: "relative", zIndex: 10, paddingBottom: "var(--space-16)", flex: 1 }}
      >

        {/* Minimum chars hint */}
        {debouncedSearch.trim().length > 0 && debouncedSearch.trim().length < 2 && (
          <div
            className="card"
            style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}
          >
            Ketik minimal 2 karakter untuk mencari…
          </div>
        )}

        {/* Category browse */}
        {debouncedSearch.trim().length === 0 && (
          <div className="card animate-fade-in" style={{ padding: "var(--space-6)" }}>
            <h2
              style={{
                fontSize: "var(--text-lg)",
                fontWeight: "var(--weight-semibold)",
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-5)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <UtensilsCrossed size={20} style={{ color: "var(--color-primary)" }} />
              Kategori Makanan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: "var(--space-3)" }}>
              {categories.map((cat: { id: string; code: string; name: string; icon?: string }) => (
                <Link
                  key={cat.id}
                  href={`/find-food/category/${cat.code}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-4)",
                    borderRadius: "var(--radius-xl)",
                    border: "1.5px solid var(--color-border)",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "var(--transition-base)",
                    backgroundColor: "var(--color-surface)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-primary-border)";
                    el.style.backgroundColor = "var(--color-primary-light)";
                    el.style.transform = "translateY(-2px)";
                    el.style.boxShadow = "var(--shadow-sm)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-border)";
                    el.style.backgroundColor = "var(--color-surface)";
                    el.style.transform = "none";
                    el.style.boxShadow = "none";
                  }}
                >
                  <span style={{ fontSize: "2rem", lineHeight: 1 }}>{cat.icon || "🍽️"}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-primary)" }}>
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {canSearch && (
          <div className="card animate-fade-in" style={{ padding: "var(--space-6)" }}>
            {/* Results header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-5)",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: 0 }}>
                Hasil: &ldquo;{debouncedSearch}&rdquo;
              </h2>
              <span className="badge badge-default">
                {searchResults.length} hasil
              </span>
            </div>

            {/* Empty */}
            {searchResults.length === 0 && !isSearching && (
              <div style={{ textAlign: "center", padding: "var(--space-12) var(--space-4)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>🔍</div>
                <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-2)" }}>
                  Makanan tidak ditemukan
                </h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
                  Coba gunakan kata kunci lain.
                </p>
              </div>
            )}

            {/* Results grid */}
            {searchResults.length > 0 && (
              <div className="grid md:grid-cols-2" style={{ gap: "var(--space-3)" }}>
                {searchResults.map((food: FoodSearchResult) => (
                  <Link
                    key={food.id}
                    href={`/find-food/${food.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-4)",
                      padding: "var(--space-4)",
                      borderRadius: "var(--radius-xl)",
                      border: "1.5px solid var(--color-border)",
                      textDecoration: "none",
                      backgroundColor: "var(--color-surface)",
                      transition: "var(--transition-base)",
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
                        width: 48, height: 48,
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: "var(--color-primary-light)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0,
                      }}
                    >
                      {food.category?.icon || "🍲"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: "var(--weight-semibold)",
                          color: "var(--color-text-primary)",
                          margin: "0 0 var(--space-1)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {food.name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            fontFamily: "var(--font-mono)",
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
                        {food.category?.name && (
                          <span className="badge badge-default">{food.category.name}</span>
                        )}
                        {food.photo_type && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-primary)" }}>
                            · {food.photo_type === "series" ? "Foto Series" : "Foto Range"}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={18} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
