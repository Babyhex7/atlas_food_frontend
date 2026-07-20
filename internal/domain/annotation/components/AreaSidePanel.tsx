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
  onLinkFood: (localId: string, foodId: string | null) => void;
  onDelete: (localId: string) => void;
};

/** Daftar area: nama, tautan food master, dan hapus (brief §8.1) */
export function AreaSidePanel({
  areas,
  selectedLocalId,
  onSelect,
  onRename,
  onLinkFood,
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
                onChange={(foodId) => onLinkFood(area.localId, foodId)}
              />
            </div>

            <p
              className={cn(
                "text-xs mt-2 mb-0",
                tooFewPoints ? "text-danger font-medium" : "text-text-muted"
              )}
            >
              {area.polygon.length} titik
              {tooFewPoints && ` — minimal ${MIN_POLYGON_POINTS} agar bisa dipublish`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
