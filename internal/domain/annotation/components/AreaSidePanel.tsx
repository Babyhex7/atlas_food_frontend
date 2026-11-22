"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import type { DraftArea } from "../types/annotation";
import { MIN_POLYGON_POINTS, areaColor } from "../constants/annotationStatus";
import { AreaFoodPicker } from "./AreaFoodPicker";

type AreaSidePanelProps = {
  areas: DraftArea[];
  selectedLocalId: string | null;
  targetWeightGram?: number;
  onSelect: (localId: string) => void;
  onRename: (localId: string, name: string) => void;
  onLinkFood: (localId: string, foodId: string | null, foodName?: string) => void;
  onWeightChange: (localId: string, weight: number | null) => void;
  onDelete: (localId: string) => void;
};

/** Daftar area: nama, tautan food master, berat gram, dan hapus (brief §8.1) */
export function AreaSidePanel({
  areas,
  selectedLocalId,
  targetWeightGram,
  onSelect,
  onRename,
  onLinkFood,
  onWeightChange,
  onDelete,
}: AreaSidePanelProps) {
  const totalWeight = areas.reduce((sum, a) => sum + (a.weightGram ?? 0), 0);
  const hasTarget = typeof targetWeightGram === "number" && targetWeightGram > 0;
  const isMatch = hasTarget && Math.abs(totalWeight - targetWeightGram) < 0.1;
  const diff = hasTarget ? targetWeightGram - totalWeight : 0;

  if (areas.length === 0) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-sm text-text-muted m-0">
            Belum ada area. Pilih mode <strong>Gambar</strong>, klik beberapa titik mengikuti
            bentuk makanan, lalu tekan <kbd>Enter</kbd>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hasTarget && (
        <div
          className={cn(
            "rounded-md border p-2.5 text-xs flex items-center justify-between",
            isMatch
              ? "bg-success-light text-success border-success-border font-medium"
              : "bg-warning-light text-warning border-warning-border"
          )}
        >
          <span>
            Bobot Area: <strong>{totalWeight.toFixed(1)}g</strong> / {targetWeightGram}g
          </span>
          <span className="font-semibold text-[11px]">
            {isMatch ? "✓ Cocok" : `Kurang: ${diff > 0 ? `${diff.toFixed(1)}g` : `${Math.abs(diff).toFixed(1)}g lebih`}`}
          </span>
        </div>
      )}
      {areas.map((area, index) => {
        const color = areaColor(index);
        const selected = area.localId === selectedLocalId;
        const tooFewPoints = area.polygon.length < MIN_POLYGON_POINTS;

        return (
          <div
            key={area.localId}
            onClick={() => onSelect(area.localId)}
            className={cn(
              "rounded-xl border p-3.5 cursor-pointer transition-fast shadow-2xs flex flex-col gap-2.5",
              selected
                ? "border-primary bg-primary-light/50 ring-1 ring-primary/30"
                : "border-border bg-surface hover:border-border-strong hover:bg-surface-alt/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <input
                type="text"
                value={area.name}
                onChange={(event) => onRename(area.localId, event.target.value)}
                onClick={(event) => event.stopPropagation()}
                placeholder="Nama bagian makanan…"
                className="flex-1 text-sm font-semibold min-w-0 px-2 py-1 rounded-md border border-border/80 bg-surface text-text-primary focus:border-primary focus:outline-none transition-fast"
              />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(area.localId);
                }}
                className="btn btn-ghost btn-xs btn-icon shrink-0 text-text-muted hover:text-danger hover:bg-danger/10"
                title="Hapus area"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div onClick={(event) => event.stopPropagation()}>
              <AreaFoodPicker
                value={area.foodId}
                onChange={(foodId, foodName) => {
                  onLinkFood(area.localId, foodId, foodName);
                  if (foodName && (/^Area \d+$/i.test(area.name.trim()) || area.name.trim() === "")) {
                    onRename(area.localId, foodName);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5" onClick={(event) => event.stopPropagation()}>
              <label htmlFor={`weight-${area.localId}`} className="text-xs font-medium text-text-secondary shrink-0">
                Bobot porsi:
              </label>
              <div className="relative w-28">
                <input
                  id={`weight-${area.localId}`}
                  type="number"
                  min="0"
                  step="any"
                  value={area.weightGram ?? ""}
                  onChange={(event) => {
                    const val = event.target.value.trim();
                    const num = Number(val);
                    onWeightChange(area.localId, val === "" || isNaN(num) ? null : Math.max(0, num));
                  }}
                  placeholder="0"
                  className="w-full text-xs font-semibold py-1 pl-2 pr-6 rounded-md border border-border bg-surface text-text-primary focus:border-primary outline-none transition-fast text-right"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted pointer-events-none">
                  g
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/50 text-text-muted">
              <span className={cn(tooFewPoints && "text-danger font-medium")}>
                {tooFewPoints
                  ? `Min. ${MIN_POLYGON_POINTS} titik (${area.polygon.length} terdaftar)`
                  : `${area.polygon.length} titik koordinat`}
              </span>
              <span className="font-semibold text-text-secondary">
                {area.weightGram != null && area.weightGram > 0 ? `${area.weightGram} g` : "Belum diisi"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
