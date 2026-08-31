"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCanvasStore } from "../store/canvasStore";
import { useCollabStore } from "../store/collabStore";
import { canEditRoom } from "../lib/messageRouter";
import type { CollabSend } from "./useWebSocket";
import type { CanvasPoint } from "../types/collab";

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

  // Flush titik-titik coretan tertahan ke WebSocket per 16ms (60 FPS throttling)
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

  // Handler mulai menggambar / laser
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!canEdit || !isDrawingMode || !isCanvasVisible) return;
      const pt = getNormalizedPoint(e.clientX, e.clientY);
      if (!pt) return;

      if (activeTool === "laser") {
        send("canvas_laser_move", {
          x: pt.x,
          y: pt.y,
          color: activeColor,
        });
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

      // Start 60 FPS batch timer
      if (!batchIntervalRef.current) {
        batchIntervalRef.current = setInterval(flushPendingPoints, 16);
      }
    },
    [
      canEdit,
      isDrawingMode,
      isCanvasVisible,
      getNormalizedPoint,
      activeTool,
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
          send("canvas_laser_move", {
            x: pt.x,
            y: pt.y,
            color: activeColor,
          });
        }
        return;
      }

      if (!isDrawing.current || !currentStrokeId.current) return;
      pendingPoints.current.push(pt);
    },
    [canEdit, isDrawingMode, isCanvasVisible, getNormalizedPoint, activeTool, send, activeColor]
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

  // Cleanup timers saat unmount
  useEffect(() => {
    return () => {
      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
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
