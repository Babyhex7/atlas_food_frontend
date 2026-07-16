"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { getAccessToken } from "@/internal/lib/cookies";
import { Plus, Pencil, ChevronRight, Search } from "lucide-react";
import type { Food } from "../types/food";

// Fallback: if no query function is available, just render the passed foods prop
export function FoodList({ foods = [] }: { foods?: Food[] }) {
  const router = useRouter();

  if (foods.length === 0) {
    return (
      <div className="p-6 px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Makanan</h1>
            <p className="text-sm text-text-muted m-0">0 makanan ditemukan</p>
          </div>
          <Button onClick={() => router.push("/admin/foods/new")}><Plus size={15} /> Tambah Makanan</Button>
        </div>
        <EmptyState icon="🍽️" title="Belum ada makanan" description="Tambahkan makanan ke database Atlas Food." action={<Button onClick={() => router.push("/admin/foods/new")}><Plus size={14} /> Tambah Makanan</Button>} />
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Makanan</h1>
          <p className="text-sm text-text-muted m-0">{foods.length} makanan ditemukan</p>
        </div>
        <Button onClick={() => router.push("/admin/foods/new")}><Plus size={15} /> Tambah Makanan</Button>
      </div>

      <div className="flex flex-col gap-2">
        {foods.map((food) => (
          <Link
            key={food.id}
            href={`/admin/foods/${food.id}`}
            className="flex items-center gap-4 py-4 px-5 rounded-xl border-[1.5px] border-border bg-surface no-underline transition-base hover:border-primary-border hover:shadow-sm hover:-translate-y-px"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-xl shrink-0">
              {(food as any).category?.icon || "🍽️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                {food.name}
              </p>
              <p className="text-xs text-text-muted m-0 font-mono">
                {(food as any).code}
              </p>
            </div>
            <ChevronRight size={16} className="text-text-muted shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
