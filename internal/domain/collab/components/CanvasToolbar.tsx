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
  ChevronUp,
  ChevronDown,
  Palette,
  Minus,
  Maximize2,
} from "lucide-react";

const PALETTE = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#FFFFFF"];
const STROKE_WIDTHS = [2, 4, 8];

interface CanvasToolbarProps {
  onClear?: () => void;
}

export function CanvasToolbar({ onClear }: CanvasToolbarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 font-sans select-none pointer-events-auto">
      {/* Container Main Toolbar */}
      <div className="flex flex-col bg-slate-900/90 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
        {/* Header / Toggle Button */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700/50 text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Annotation</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDrawingMode(!isDrawingMode)}
              title={isDrawingMode ? "Matikan Mode Gambar" : "Nyalakan Mode Gambar"}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                isDrawingMode
                  ? "bg-rose-500 text-white shadow"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {isDrawingMode ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Toolbar Controls (Expanded) */}
        {!isMinimized && (
          <div className="p-2.5 flex flex-col gap-2.5">
            {/* Tools Selector */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleToolSelect("pencil")}
                title="Pensil (Bebas)"
                className={`p-2 rounded-lg transition ${
                  activeTool === "pencil" && isDrawingMode
                    ? "bg-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Pencil className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToolSelect("circle")}
                title="Lingkaran"
                className={`p-2 rounded-lg transition ${
                  activeTool === "circle" && isDrawingMode
                    ? "bg-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Circle className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToolSelect("rectangle")}
                title="Persegi Panjang"
                className={`p-2 rounded-lg transition ${
                  activeTool === "rectangle" && isDrawingMode
                    ? "bg-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToolSelect("laser")}
                title="Laser Pointer (Pudar Otomatis)"
                className={`p-2 rounded-lg transition ${
                  activeTool === "laser" && isDrawingMode
                    ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                }`}
              >
                <Zap className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleToolSelect("eraser")}
                title="Penghapus Stroke"
                className={`p-2 rounded-lg transition ${
                  activeTool === "eraser" && isDrawingMode
                    ? "bg-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* Colors & Width Options */}
            <div className="flex items-center justify-between gap-2 px-1">
              {/* Color Dots */}
              <div className="flex items-center gap-1.5">
                {PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-5 h-5 rounded-full border border-slate-700 transition transform hover:scale-110 ${
                      activeColor === color ? "ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900 scale-110" : ""
                    }`}
                  />
                ))}
              </div>

              {/* Stroke Width Selector */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
                {STROKE_WIDTHS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWidth(w)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition ${
                      activeWidth === w ? "bg-slate-700 text-rose-400" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Visibility & Clear */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
              <button
                onClick={toggleCanvasVisible}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {isCanvasVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isCanvasVisible ? "Tampil" : "Sembunyi"}</span>
              </button>

              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg transition font-medium text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
