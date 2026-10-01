"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import type { DraftArea } from "../types/annotation";
import { MIN_POLYGON_POINTS, areaColor } from "../constants/annotationStatus";
import { AreaFoodPicker } from "./AreaFoodPicker";

type AreaSidePanelProps = {
  areas: DraftArea[];
  selectedLocalId: string | null;
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
  onSelect,
  onRename,
  onLinkFood,
  onWeightChange,
  onDelete,
}: AreaSidePanelProps) {
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
      {areas.map((area, index) => {
        const color = areaColor(index);
        const selected = area.localId === selectedLocalId;
        const tooFewPoints = area.polygon.length < MIN_POLYGON_POINTS;

        return (
          <div
            key={area.localId}
            onClick={() => onSelect(area.localId)}
            className={cn(
              "rounded-md border p-3 cursor-pointer transition-fast",
              selected ? "border-primary bg-primary-light" : "border-border bg-surface hover:bg-surface-alt"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <input
                type="text"
                value={area.name}
                onChange={(event) => onRename(area.localId, event.target.value)}
                onClick={(event) => event.stopPropagation()}
                placeholder="Nama area"
                className="flex-1 text-sm font-medium min-w-0"
              />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(area.localId);
                }}
                className="btn btn-ghost btn-xs btn-icon shrink-0"
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

            <div className="flex items-center gap-2 mt-2" onClick={(event) => event.stopPropagation()}>
              <label htmlFor={`weight-${area.localId}`} className="text-xs text-text-muted shrink-0">
                Porsi / Berat:
              </label>
              <div className="relative flex-1">
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
                  placeholder="Misal 100"
                  className="w-full text-xs py-1 px-2 pr-6 rounded border border-border bg-surface text-text-primary"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                  g
                </span>
              </div>
            </div>

            <p
              className={cn(
                "text-xs mt-2 mb-0",
                tooFewPoints ? "text-danger font-medium" : "text-text-muted"
              )}
            >
              {area.polygon.length} titik
              {area.weightGram != null && area.weightGram > 0 && ` · ${area.weightGram} g`}
              {tooFewPoints && ` — minimal ${MIN_POLYGON_POINTS} agar bisa dipublish`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
