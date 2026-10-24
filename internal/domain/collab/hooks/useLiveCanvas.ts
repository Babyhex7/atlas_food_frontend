"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCanvasStore } from "../store/canvasStore";
import { useCollabStore } from "../store/collabStore";
import { canEditRoom } from "../lib/messageRouter";
import type { CollabSend } from "./useWebSocket";
import type { CanvasPoint } from "../types/collab";

/**
 * Interval kirim batch titik coretan (ms).
 *
 * Server membatasi 50 pesan/detik per client (checkRateLimit di BE) dan pesan
 * yang melewati batas DIBUANG. 16 ms (~62 pesan/detik) + cursor_move (~15/detik)
 * membuat coretan cepat terpotong dan memunculkan banner "Terlalu banyak pesan".
 * 40 ms (~25/detik) tetap halus karena semua titik tetap dikirim (di-batch),
 * dan latensi tambahannya masih jauh di bawah target < 100 ms.
 */
export const CANVAS_BATCH_INTERVAL_MS = 40;

interface UseLiveCanvasOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  send: CollabSend;
  targetImageId?: string;
}

export function useLiveCanvas({ containerRef, send, targetImageId }: UseLiveCanvasOptions) {
  const isDrawing = useRef(false);
  const currentStrokeId = useRef<string | null>(null);
  const pendingPoints = useRef<CanvasPoint[]>([]);
  const batchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const laserFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    activeTool,
    activeColor,
    activeWidth,
    isDrawingMode,
    isCanvasVisible,
    strokes,
    laserPoints,
    setTool,
    setColor,
    setWidth,
    setDrawingMode,
    toggleCanvasVisible,
    upsertStroke,
    appendPointsToStroke,
    setLaserPoint,
    removeLaserPoint,
    clearStrokes,
  } = useCanvasStore();

  const { selfRoomRole, selfUserId } = useCollabStore();
  const canEdit = canEditRoom(selfRoomRole);

  // Helper konversi pixel lokal kontainer -> koordinat relatif (0.0 - 1.0)
  const getNormalizedPoint = useCallback(
    (clientX: number, clientY: number): CanvasPoint | null => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      return {
        x: Number(x.toFixed(4)),
        y: Number(y.toFixed(4)),
      };
    },
    [containerRef]
  );

  // Flush titik-titik coretan tertahan ke WebSocket per CANVAS_BATCH_INTERVAL_MS
  const flushPendingPoints = useCallback(() => {
    if (pendingPoints.current.length === 0 || !currentStrokeId.current) return;
    const pointsToSend = [...pendingPoints.current];
    pendingPoints.current = [];

    const strokeId = currentStrokeId.current;
    appendPointsToStroke(strokeId, pointsToSend);

    // Format tuple [[x, y], ...] untuk efisiensi payload JSON WS
    send("canvas_draw_move", {
      stroke_id: strokeId,
      points: pointsToSend.map((pt) => [pt.x, pt.y]),
    });
  }, [appendPointsToStroke, send]);

  // Laser: render lokal + kirim ke peserta lain. Server tidak memantulkan pesan
  // ke pengirimnya sendiri, jadi tanpa setLaserPoint lokal enumerator tidak
  // bisa melihat laser yang ia arahkan.
  const emitLaser = useCallback(
    (pt: CanvasPoint) => {
      setLaserPoint({
        userId: selfUserId || "local",
        username: "",
        color: activeColor,
        x: pt.x,
        y: pt.y,
        timestamp: Date.now(),
      });
      send("canvas_laser_move", { x: pt.x, y: pt.y, color: activeColor });
    },
    [setLaserPoint, selfUserId, activeColor, send]
  );

  // Handler mulai menggambar / laser
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!canEdit || !isDrawingMode || !isCanvasVisible) return;
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      if (!pt) return;

      if (activeTool === "laser") {
        emitLaser(pt);
        return;
      }

      isDrawing.current = true;
      const strokeId = `str_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      currentStrokeId.current = strokeId;
      pendingPoints.current = [];

      // Local optimistic stroke render
      upsertStroke({
        id: strokeId,
        userId: selfUserId || "local",
        tool: activeTool,
        color: activeColor,
        width: activeWidth,
        targetImageId,
        points: [pt],
        timestamp: Date.now(),
      });

      send("canvas_draw_start", {
        stroke_id: strokeId,
        tool: activeTool,
        color: activeColor,
        width: activeWidth,
        target_image_id: targetImageId,
        x: pt.x,
        y: pt.y,
      });

      // Start batch timer
      if (!batchIntervalRef.current) {
        batchIntervalRef.current = setInterval(flushPendingPoints, CANVAS_BATCH_INTERVAL_MS);
      }
    },
    [
      canEdit,
      isDrawingMode,
      isCanvasVisible,
      getNormalizedPoint,
      activeTool,
      emitLaser,
      send,
      activeColor,
      activeWidth,
      targetImageId,
      upsertStroke,
      selfUserId,
      flushPendingPoints,
    ]
  );

  // Handler pergerakan menggambar / laser
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!canEdit || !isDrawingMode || !isCanvasVisible) return;
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      if (!pt) return;

      if (activeTool === "laser") {
        if (e.buttons === 1 || e.pointerType === "touch") {
          emitLaser(pt);
        }
        return;
      }

      if (!isDrawing.current || !currentStrokeId.current) return;
      pendingPoints.current.push(pt);
    },
    [canEdit, isDrawingMode, isCanvasVisible, getNormalizedPoint, activeTool, emitLaser]
  );

  // Handler penutupan stroke
  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current || !currentStrokeId.current) return;
    isDrawing.current = false;

    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }

    flushPendingPoints();

    const strokeId = currentStrokeId.current;
    currentStrokeId.current = null;

    send("canvas_draw_end", { stroke_id: strokeId });
  }, [flushPendingPoints, send]);

  // Hapus semua coretan canvas
  const handleClear = useCallback(() => {
    if (!canEdit) return;
    clearStrokes(targetImageId);
    send("canvas_clear", { target_image_id: targetImageId });
  }, [canEdit, clearStrokes, targetImageId, send]);

  // Cleanup timers saat unmount.
  //
  // Membaca ref.current DI DALAM cleanup memang disengaja di sini: yang harus
  // dibatalkan adalah timer yang aktif pada saat unmount, bukan timer yang
  // kebetulan terpasang saat effect ini dijalankan. Saran lint (menyalin
  // ref.current ke variabel lokal) justru akan membatalkan id timer yang sudah
  // basi dan membiarkan timer yang sebenarnya berjalan terus.
  useEffect(() => {
    return () => {
      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (laserFadeTimerRef.current) clearTimeout(laserFadeTimerRef.current);
    };
  }, []);

  return {
    canEdit,
    activeTool,
    activeColor,
    activeWidth,
    isDrawingMode,
    isCanvasVisible,
    strokes,
    laserPoints,
    setTool,
    setColor,
    setWidth,
    setDrawingMode,
    toggleCanvasVisible,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleClear,
  };
}
