"use client";

import { useState } from "react";
import { useCanvasStore } from "../store/canvasStore";
import { useCollabStore } from "../store/collabStore";
import { canEditRoom } from "../lib/messageRouter";
import type { CanvasTool } from "../types/collab";
import {
  Pencil,
  Circle,
  Square,
  Zap,
  Eraser,
  Trash2,
  Eye,
  EyeOff,
  X,
  Sparkles,
} from "lucide-react";

const PALETTE = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#FFFFFF"];
const STROKE_WIDTHS = [2, 4, 8];

interface CanvasToolbarProps {
  onClear?: () => void;
}

export function CanvasToolbar({ onClear }: CanvasToolbarProps) {
  // Sidebar kanan terbuka secara default atau bisa dibuka-tutup
  const [isOpen, setIsOpen] = useState(false);

  const {
    activeTool,
    activeColor,
    activeWidth,
    isDrawingMode,
    isCanvasVisible,
    setTool,
    setColor,
    setWidth,
    setDrawingMode,
    toggleCanvasVisible,
    clearStrokes,
  } = useCanvasStore();

  const selfRoomRole = useCollabStore((s) => s.selfRoomRole);
  const canEdit = canEditRoom(selfRoomRole);

  // Hanya tampil untuk owner/editor
  if (!canEdit) return null;

  const handleToolSelect = (tool: CanvasTool) => {
    setTool(tool);
    if (!isDrawingMode) setDrawingMode(true);
  };

  const handleClear = () => {
    clearStrokes();
    if (onClear) onClear();
  };

  const handleToggleDrawing = () => {
    const nextMode = !isDrawingMode;
    setDrawingMode(nextMode);
  };

  return (
    <>
      {/* ── Trigger Tab (Saat Sidebar Tertutup) ────────────────────────── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Buka Panel Live Annotation"
          className="fixed right-0 top-36 z-40 flex items-center gap-2 rounded-l-xl bg-slate-900/90 hover:bg-slate-800 text-white px-3 py-2.5 shadow-xl border-y border-l border-slate-700 backdrop-blur-md transition-all duration-200 hover:pr-4 cursor-pointer select-none"
        >
          <span className="relative flex h-2 w-2">
            {isDrawingMode && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isDrawingMode ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
          </span>
          <Pencil className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Live Canvas
          </span>
        </button>
      )}

      {/* ── Collapsible Right Sidebar ───────────────────────────────────── */}
      <aside
        aria-label="Panel Live Annotation"
        className={`fixed top-14 bottom-0 right-0 z-40 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md text-white border-l border-slate-700/80 shadow-2xl flex flex-col font-sans transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Live Annotation
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup panel Live Canvas"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Konten Controls */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 text-xs">
          {/* Mode Gambar Toggle Switch */}
          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Mode Menggambar</span>
              <span className="text-[11px] text-slate-400">
                {isDrawingMode ? "Kursor aktif untuk coretan" : "Mode lihat biasa"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleDrawing}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                isDrawingMode
                  ? "bg-rose-600 text-white shadow-rose-900/40"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {isDrawingMode ? "ON" : "OFF"}
            </button>
          </div>

          {/* Pilihan Alat Gambar */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Peralatan Gambar
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleToolSelect("pencil")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition ${
                  activeTool === "pencil" && isDrawingMode
                    ? "bg-rose-600/20 border-rose-500 text-rose-300 font-semibold shadow"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Pencil className="w-4 h-4" />
                <span className="text-[10px]">Pensil</span>
              </button>

              <button
                type="button"
                onClick={() => handleToolSelect("rectangle")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition ${
                  activeTool === "rectangle" && isDrawingMode
                    ? "bg-rose-600/20 border-rose-500 text-rose-300 font-semibold shadow"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Square className="w-4 h-4" />
                <span className="text-[10px]">Kotak</span>
              </button>

              <button
                type="button"
                onClick={() => handleToolSelect("circle")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition ${
                  activeTool === "circle" && isDrawingMode
                    ? "bg-rose-600/20 border-rose-500 text-rose-300 font-semibold shadow"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Circle className="w-4 h-4" />
                <span className="text-[10px]">Lingkaran</span>
              </button>

              <button
                type="button"
                onClick={() => handleToolSelect("laser")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition ${
                  activeTool === "laser" && isDrawingMode
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 font-semibold shadow"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-[10px]">Laser</span>
              </button>

              <button
                type="button"
                onClick={() => handleToolSelect("eraser")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition ${
                  activeTool === "eraser" && isDrawingMode
                    ? "bg-rose-600/20 border-rose-500 text-rose-300 font-semibold shadow"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span className="text-[10px]">Penghapus</span>
              </button>
            </div>
          </div>

          {/* Palet Warna */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pilihan Warna
            </span>
            <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full border border-slate-700 transition transform hover:scale-110 cursor-pointer ${
                    activeColor === color
                      ? "ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900 scale-110"
                      : ""
                  }`}
                  aria-label={`Pilih warna ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Ketebalan Garis */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Ketebalan Garis
            </span>
            <div className="grid grid-cols-3 gap-2">
              {STROKE_WIDTHS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWidth(w)}
                  className={`py-2 px-3 text-center rounded-xl border font-bold text-xs transition ${
                    activeWidth === w
                      ? "bg-rose-600/20 border-rose-500 text-rose-300"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>

          {/* Visibilitas & Aksi Bersihkan */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-800 mt-auto">
            <button
              type="button"
              onClick={toggleCanvasVisible}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold"
            >
              {isCanvasVisible ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Sembunyikan Coretan</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span>Tampilkan Coretan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Semua Coretan</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
