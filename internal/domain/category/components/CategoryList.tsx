"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { Plus, ChevronRight } from "lucide-react";
import type { Category } from "../types/category";

export function CategoryList({ categories = [] }: { categories?: Category[] }) {
  const router = useRouter();

  return (
    <div style={{ padding: "var(--space-6) var(--space-8)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)", margin: "0 0 var(--space-1)" }}>
            Kategori
          </h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
            {categories.length} kategori ditemukan
          </p>
        </div>
        <Button onClick={() => router.push("/admin/categories/new")}>
          <Plus size={15} /> Tambah Kategori
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon="📂"
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengelompokkan makanan."
          action={<Button onClick={() => router.push("/admin/categories/new")}><Plus size={14} /> Tambah Kategori</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: "var(--space-3)" }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/admin/categories/${cat.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-xl)",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                textDecoration: "none",
                transition: "var(--transition-base)",
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
              <div
                style={{
                  width: 48, height: 48,
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-primary-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", flexShrink: 0,
                }}
              >
                {cat.icon || "📂"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cat.name}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0, fontFamily: "var(--font-mono)" }}>
                  {(cat as any).code}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
