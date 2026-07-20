"use client";

import { useState } from "react";
import { cn } from "@/internal/lib/cn";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import { usePublishedAnnotation, usePublishedAnnotationsByFood } from "../hooks/useAnnotationQueries";
import { AnnotatedFoodViewer } from "./AnnotatedFoodViewer";

type FoodAnnotationSectionProps = {
  foodId: string;
};

/**
 * Bagian anotasi di halaman detail Find Food.
 *
 * Menghilang total bila food ini belum punya gambar published — halaman
 * detail tidak boleh menampilkan bingkai kosong hanya karena anotasinya
 * belum dibuat.
 */
export function FoodAnnotationSection({ foodId }: FoodAnnotationSectionProps) {
  const { data: images, isLoading } = usePublishedAnnotationsByFood(foodId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = images ?? [];
  const activeId = selectedId ?? list[0]?.id ?? null;
  const { data: image } = usePublishedAnnotation(activeId ?? undefined);

  if (isLoading || list.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-text-primary m-0">Kenali bagiannya</h2>

      {/* Pemilih gambar hanya muncul bila memang ada lebih dari satu */}
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                "shrink-0 rounded-sm border-2 overflow-hidden transition-fast",
                item.id === activeId ? "border-primary" : "border-transparent hover:border-border"
              )}
              title={item.title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_ASSET_ORIGIN}${item.thumbnail_url || item.image_url}`}
                alt={item.title}
                className="w-20 h-14 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {image && <AnnotatedFoodViewer image={image} />}
    </section>
  );
}
