"use client";

import { Maximize2, MousePointer2, PenLine, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/internal/lib/cn";
import type { EditorMode } from "../types/annotation";

type ZoomToolbarProps = {
  zoom: number;
  mode: EditorMode;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onModeChange: (mode: EditorMode) => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function ZoomToolbar({
  zoom,
  mode,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
  onModeChange,
  onUndo,
  onRedo,
}: ZoomToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap p-2 rounded-md border border-border bg-surface">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onModeChange("draw")}
          className={cn("btn btn-sm", mode === "draw" ? "btn-primary" : "btn-outline")}
          title="Mode gambar — klik untuk menambah titik"
        >
          <PenLine size={14} />
          Gambar
        </button>
        <button
          type="button"
          onClick={() => onModeChange("edit")}
          className={cn("btn btn-sm", mode === "edit" ? "btn-primary" : "btn-outline")}
          title="Mode edit — pilih area lalu geser titiknya"
        >
          <MousePointer2 size={14} />
          Edit
        </button>
      </div>

      <span className="w-px h-6 bg-border" aria-hidden />

      <div className="flex items-center gap-1">
        <button type="button" onClick={onZoomOut} className="btn btn-outline btn-sm btn-icon" title="Perkecil">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-mono text-text-muted w-12 text-center tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" onClick={onZoomIn} className="btn btn-outline btn-sm btn-icon" title="Perbesar">
          <ZoomIn size={14} />
        </button>
        <button type="button" onClick={onResetView} className="btn btn-outline btn-sm btn-icon" title="Reset tampilan">
          <Maximize2 size={14} />
        </button>
      </div>

      <span className="w-px h-6 bg-border" aria-hidden />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="btn btn-outline btn-sm btn-icon"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="btn btn-outline btn-sm btn-icon"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      <p className="text-xs text-text-muted ml-auto">
        Ctrl+scroll: zoom · Shift+drag: geser · Enter: selesaikan polygon · Esc: batal
      </p>
    </div>
  );
}
