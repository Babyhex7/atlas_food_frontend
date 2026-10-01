"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Layers, Sparkles } from "lucide-react";
import { useAnnotationDetail } from "../hooks/useAnnotationQueries";
import {
  ANNOTATION_STATUS_CLASS,
  ANNOTATION_STATUS_LABEL,
  areaColor,
} from "../constants/annotationStatus";
import { AnnotatedFoodViewer } from "./AnnotatedFoodViewer";
import { Button } from "@/internal/pkg/components/Button";

type AnnotationPreviewProps = {
  id: string;
};

/**
 * Pratinjau interaktif admin: menampilkan kanvas dengan poligon yang terlihat jelas,
 * tombol toggle visibilitas, serta chip area yang bisa diklik untuk highlight.
 */
export function AnnotationPreview({ id }: AnnotationPreviewProps) {
  const { data: image, isLoading, error } = useAnnotationDetail(id);
  const [visiblePolygons, setVisiblePolygons] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="p-6 text-sm text-text-muted">Memuat pratinjau…</div>;
  }

  if (error || !image) {
    return (
      <div className="p-6">
        <div className="alert alert-danger">
          <span className="text-sm">
            {error instanceof Error ? error.message : "Gambar anotasi tidak ditemukan"}
          </span>
        </div>
      </div>
    );
  }

  const areas = image.areas ?? [];
  const totalWeight = areas.reduce((sum, a) => sum + (a.weight_gram ?? 0), 0);

  return (
    <div className="p-6 flex flex-col gap-5 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/annotations/${id}`}
            className="btn btn-ghost btn-sm btn-icon"
            title="Kembali ke editor"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary m-0">{image.title}</h1>
              <span className={ANNOTATION_STATUS_CLASS[image.status]}>
                {ANNOTATION_STATUS_LABEL[image.status]}
              </span>
            </div>
            <p className="text-xs text-text-muted m-0 mt-0.5">
              Pratinjau interaktif · {image.width} × {image.height} px · {areas.length} area terdaftar
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={visiblePolygons ? "secondary" : "outline"}
            onClick={() => setVisiblePolygons(!visiblePolygons)}
            className="text-xs gap-1.5"
          >
            {visiblePolygons ? <Eye size={13} /> : <EyeOff size={13} />}
            {visiblePolygons ? "Poligon: ON" : "Poligon: OFF"}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={showLabels ? "secondary" : "outline"}
            onClick={() => setShowLabels(!showLabels)}
            className="text-xs gap-1.5"
            disabled={!visiblePolygons}
          >
            <Layers size={13} />
            {showLabels ? "Label: ON" : "Label: OFF"}
          </Button>

          <Link href={`/admin/annotations/${id}`} className="btn btn-primary btn-sm text-xs">
            Edit Poligon
          </Link>
        </div>
      </div>

      {/* Main Interactive Canvas Viewer */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
        <AnnotatedFoodViewer
          image={image}
          visiblePolygons={visiblePolygons}
          showLabels={showLabels}
          selectedAreaId={selectedAreaId}
          onAreaSelect={(area) => setSelectedAreaId(area.id)}
        />
      </div>

      {/* Interactive Area Chips & Summary */}
      {areas.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              Bagian Makanan Terdaftar ({areas.length})
            </span>
            <span className="text-xs text-text-muted font-mono">
              Total Bobot: <strong className="text-text-primary">{totalWeight.toFixed(1)} g</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {areas.map((area, idx) => {
              const color = areaColor(idx);
              const isSelected = area.id === selectedAreaId;

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedAreaId(isSelected ? null : area.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-fast ${
                    isSelected
                      ? "border-primary bg-primary-light text-primary shadow-xs"
                      : "border-border bg-surface-alt text-text-secondary hover:border-border-strong hover:bg-surface"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{area.name}</span>
                  {area.weight_gram != null && area.weight_gram > 0 && (
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-text-muted border border-border">
                      {area.weight_gram}g
                    </span>
                  )}
                  {isSelected && <CheckCircle2 size={12} className="text-primary ml-0.5" />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-text-muted m-0">
            Klik chip di atas untuk menyorot poligon area di kanvas.
          </p>
        </div>
      )}
    </div>
  );
}
