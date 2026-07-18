"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { getAccessToken } from "@/internal/lib/cookies";
import { Plus, Pencil, ChevronRight, Search, UtensilsCrossed } from "lucide-react";
import type { Food } from "../types/food";

// Fallback: if no query function is available, just render the passed foods prop
export function FoodList({ foods = [] }: { foods?: Food[] }) {
  const router = useRouter();

  if (foods.length === 0) {
    return (
      <div style={{ padding: "var(--space-6) var(--space-8)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
          <div>
            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>Makanan</h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>0 makanan ditemukan</p>
          </div>
          <Button onClick={() => router.push("/admin/foods/new")}><Plus size={15} /> Tambah Makanan</Button>
        </div>
        <EmptyState icon="🍽️" title="Belum ada makanan" description="Tambahkan makanan ke database Atlas Food." action={<Button onClick={() => router.push("/admin/foods/new")}><Plus size={14} /> Tambah Makanan</Button>} />
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-6) var(--space-8)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>Makanan</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>{foods.length} makanan ditemukan</p>
        </div>
        <Button onClick={() => router.push("/admin/foods/new")}><Plus size={15} /> Tambah Makanan</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {foods.map((food) => (
          <Link
            key={food.id}
            href={`/admin/foods/${food.id}`}
            style={{
              display: "flex", alignItems: "center", gap: "var(--space-4)",
              padding: "var(--space-4) var(--space-5)",
              borderRadius: "var(--radius-xl)", border: "1.5px solid var(--color-border)",
              backgroundColor: "var(--color-surface)", textDecoration: "none",
              transition: "var(--transition-base)",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-primary-border)"; el.style.boxShadow = "var(--shadow-sm)"; el.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--color-border)"; el.style.boxShadow = "none"; el.style.transform = "none"; }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
              {(food as any).category?.icon || "🍽️"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {food.name}
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0, fontFamily: "var(--font-mono)" }}>
                {(food as any).code}
              </p>
            </div>
            <ChevronRight size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
