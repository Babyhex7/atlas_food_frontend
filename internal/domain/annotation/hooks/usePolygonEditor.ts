"use client";

import { useCallback, useEffect, useState } from "react";
import { useAnnotationEditorStore } from "../store/annotationEditorStore";
import { MIN_POLYGON_POINTS } from "../constants/annotationStatus";
import type { Point } from "../types/annotation";

export type DragTarget = { localId: string; vertexIndex: number };

/**
 * Logika interaksi polygon: mode gambar/edit, drag vertex, shortcut keyboard.
 *
 * Hook ini tidak tahu apa-apa soal SVG atau pointer event — komponen kanvas
 * yang menerjemahkan event jadi koordinat gambar, lalu memanggil fungsi di sini.
 */
export function usePolygonEditor() {
  const mode = useAnnotationEditorStore((s) => s.mode);
  const areas = useAnnotationEditorStore((s) => s.areas);
  const drawingPolygon = useAnnotationEditorStore((s) => s.drawingPolygon);
  const selectedLocalId = useAnnotationEditorStore((s) => s.selectedLocalId);

  const setMode = useAnnotationEditorStore((s) => s.setMode);
  const selectArea = useAnnotationEditorStore((s) => s.selectArea);
  const addDrawingPoint = useAnnotationEditorStore((s) => s.addDrawingPoint);
  const undoDrawingPoint = useAnnotationEditorStore((s) => s.undoDrawingPoint);
  const commitDrawing = useAnnotationEditorStore((s) => s.commitDrawing);
  const cancelDrawing = useAnnotationEditorStore((s) => s.cancelDrawing);
  const moveVertex = useAnnotationEditorStore((s) => s.moveVertex);
  const deleteVertex = useAnnotationEditorStore((s) => s.deleteVertex);
  const deleteArea = useAnnotationEditorStore((s) => s.deleteArea);
  const undo = useAnnotationEditorStore((s) => s.undo);
  const redo = useAnnotationEditorStore((s) => s.redo);

  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

  const canCommitDrawing = drawingPolygon.length >= MIN_POLYGON_POINTS;

  const startDrag = useCallback((localId: string, vertexIndex: number) => {
    setDragTarget({ localId, vertexIndex });
  }, []);

  const dragTo = useCallback(
    (point: Point) => {
      if (!dragTarget) return;
      moveVertex(dragTarget.localId, dragTarget.vertexIndex, point);
    },
    [dragTarget, moveVertex]
  );

  const endDrag = useCallback(() => setDragTarget(null), []);

  /** Klik kanvas: tambah titik saat menggambar, batalkan seleksi saat edit */
  const handleCanvasClick = useCallback(
    (point: Point) => {
      if (mode === "draw") {
        addDrawingPoint(point);
        return;
      }
      selectArea(null);
    },
    [mode, addDrawingPoint, selectArea]
  );

  // Shortcut keyboard editor
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Jangan bajak tombol saat admin sedang mengetik nama area
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (drawingPolygon.length > 0) cancelDrawing();
        else selectArea(null);
        return;
      }

      if (event.key === "Enter" && mode === "draw" && canCommitDrawing) {
        event.preventDefault();
        commitDrawing("");
        return;
      }

      // Backspace: buang titik terakhir saat menggambar, hapus area saat edit
      if (event.key === "Backspace" || event.key === "Delete") {
        if (mode === "draw" && drawingPolygon.length > 0) {
          event.preventDefault();
          undoDrawingPoint();
          return;
        }
        if (mode === "edit" && selectedLocalId) {
          event.preventDefault();
          deleteArea(selectedLocalId);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    mode,
    drawingPolygon.length,
    canCommitDrawing,
    selectedLocalId,
    undo,
    redo,
    cancelDrawing,
    commitDrawing,
    undoDrawingPoint,
    deleteArea,
    selectArea,
  ]);

  return {
    mode,
    areas,
    drawingPolygon,
    selectedLocalId,
    dragTarget,
    canCommitDrawing,
    setMode,
    selectArea,
    handleCanvasClick,
    startDrag,
    dragTo,
    endDrag,
    commitDrawing,
    cancelDrawing,
    undoDrawingPoint,
    deleteVertex,
    deleteArea,
    undo,
    redo,
  };
}
