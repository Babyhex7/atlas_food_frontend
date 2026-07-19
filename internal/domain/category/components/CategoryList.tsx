"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { Plus, ChevronRight, FolderOpen } from "lucide-react";
import type { Category } from "../types/category";

export function CategoryList({ categories = [] }: { categories?: Category[] }) {
  const router = useRouter();

  return (
    <div className="p-6 px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Kategori
          </h1>
          <p className="text-sm text-text-muted m-0">
            {categories.length} kategori ditemukan
          </p>
        </div>
        <Button onClick={() => router.push("/admin/categories/new")}>
          <Plus size={15} /> Tambah Kategori
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={40} className="text-text-muted" />}
          title="Belum ada kategori"
          description="Tambahkan kategori untuk mengelompokkan makanan."
          action={<Button onClick={() => router.push("/admin/categories/new")}><Plus size={14} /> Tambah Kategori</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/admin/categories/${cat.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-border bg-surface no-underline transition-base hover:border-primary-border hover:bg-primary-light hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                {cat.icon
                  ? <span className="text-2xl">{cat.icon}</span>
                  : <FolderOpen size={22} className="text-primary" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                  {cat.name}
                </p>
                <p className="text-xs text-text-muted m-0 font-mono">
                  {(cat as any).code}
                </p>
              </div>
              <ChevronRight size={16} className="text-text-muted shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
