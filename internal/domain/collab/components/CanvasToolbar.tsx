"use client";

import { useState, useRef } from "react";
import { useCanvasStore } from "../store/canvasStore";
import { useCollabStore } from "../store/collabStore";
import { useCollab } from "./CollabSession";
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
  Minimize2,
} from "lucide-react";

const PALETTE = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#FFFFFF"];
const STROKE_WIDTHS = [2, 4, 8];

interface CanvasToolbarProps {
  onClear?: () => void;
}

export function CanvasToolbar({ onClear }: CanvasToolbarProps) {
  // Floating palette dibuka-tutup
  const [isOpen, setIsOpen] = useState(false);
  const { send } = useCollab();

  // Posisi shortcut tombol pensil yang dapat dipindahkan (draggable)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

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
    send("canvas_clear", {});
    if (onClear) onClear();
  };

  const handleToggleDrawing = () => {
    const nextMode = !isDrawingMode;
    setDrawingMode(nextMode);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragRef.current.hasMoved = true;
    }
    const newX = Math.max(12, Math.min(window.innerWidth - 56, dragRef.current.initialX + deltaX));
    const newY = Math.max(64, Math.min(window.innerHeight - 56, dragRef.current.initialY + deltaY));
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleTriggerClick = () => {
    if (dragRef.current.hasMoved) return;
    setIsOpen(true);
  };

  return (
    <>
      {/* ── Trigger Icon Pensil Draggable (Tanpa Tulisan) ──────────────── */}
      {!isOpen && (
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleTriggerClick}
          title="Alat Gambar Live Annotation (Geser untuk memindahkan)"
          aria-label="Buka Live Canvas Annotation"
          style={
            pos
              ? { left: `${pos.x}px`, top: `${pos.y}px` }
              : { bottom: "5.5rem", right: "1.5rem" }
          }
          className="fixed z-[70] h-11 w-11 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white shadow-xl border border-slate-700/80 backdrop-blur-xl flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-transform active:scale-95 group touch-none"
        >
          {isDrawingMode && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          )}
          <Pencil className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* ── Floating Modern Palette (Saat Terbuka Tetap di Kanan) ───────── */}
      {isOpen && (
        <div
          role="region"
          aria-label="Panel Live Annotation"
          className="fixed top-16 right-4 sm:right-6 z-[70] w-72 sm:w-80 max-h-[calc(100vh-5rem)] rounded-2xl bg-slate-900/95 backdrop-blur-xl text-white border border-slate-700/80 shadow-2xl flex flex-col font-sans transition-all duration-200 animate-in fade-in zoom-in-95 overflow-hidden"
        >
          {/* Header Panel */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60 select-none">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Live Annotation
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimalkan panel"
                aria-label="Minimalkan panel"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup panel Live Canvas"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Konten Controls */}
          <div className="overflow-y-auto p-4 flex flex-col gap-4 text-xs scrollbar-thin">
            {/* Mode Gambar Toggle Switch */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-semibold text-slate-200 block text-xs">Mode Menggambar</span>
                <span className="text-[10px] text-slate-400">
                  {isDrawingMode ? "Kursor aktif untuk coretan" : "Mode lihat biasa"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleDrawing}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
                  isDrawingMode
                    ? "bg-rose-600 text-white shadow-rose-900/40"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {isDrawingMode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Pilihan Alat Gambar */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Peralatan Gambar
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: "pencil", label: "Pensil", icon: Pencil },
                  { id: "rectangle", label: "Kotak", icon: Square },
                  { id: "circle", label: "Lingkaran", icon: Circle },
                  { id: "laser", label: "Laser", icon: Zap },
                  { id: "eraser", label: "Penghapus", icon: Eraser },
                ].map(({ id, label, icon: Icon }) => {
                  const isActive = activeTool === id && isDrawingMode;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      onClick={() => handleToolSelect(id as CanvasTool)}
                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition ${
                        isActive
                          ? "bg-rose-600/25 border-rose-500 text-rose-300 font-semibold shadow-inner"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[9px] leading-none">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Palet Warna */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pilihan Warna
              </span>
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                {PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border border-slate-700 transition transform hover:scale-110 cursor-pointer ${
                      activeColor === color
                        ? "ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900 scale-110"
                        : "opacity-85 hover:opacity-100"
                    }`}
                    aria-label={`Pilih warna ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Ketebalan Garis */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Ketebalan Garis
              </span>
              <div className="grid grid-cols-3 gap-2">
                {STROKE_WIDTHS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWidth(w)}
                    className={`py-1.5 px-2 text-center rounded-xl border font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      activeWidth === w
                        ? "bg-rose-600/25 border-rose-500 text-rose-300"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{ width: `${w * 1.5}px`, height: `${w * 1.5}px` }}
                    />
                    <span>{w}px</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibilitas & Aksi Bersihkan */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={toggleCanvasVisible}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold border border-slate-700/60"
              >
                {isCanvasVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sembunyikan Coretan</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tampilkan Coretan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition text-xs font-semibold border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Semua Coretan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

