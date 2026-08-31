"use client";

import { useEffect, useRef } from "react";
import { useLiveCanvas } from "../hooks/useLiveCanvas";
import type { CollabSend } from "../hooks/useWebSocket";
import type { CanvasStroke, LaserPoint } from "../types/collab";

interface LiveCanvasOverlayProps {
  send: CollabSend;
  targetImageId?: string;
  className?: string;
}

export function LiveCanvasOverlay({ send, targetImageId, className = "" }: LiveCanvasOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const {
    canEdit,
    activeTool,
    activeColor,
    activeWidth,
    isDrawingMode,
    isCanvasVisible,
    strokes,
    laserPoints,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useLiveCanvas({ containerRef, send, targetImageId });

  // Main Render Engine (Canvas 2D Context)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas resolution to match container pixel dimensions
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);
    updateCanvasSize();

    // Render Function
    const render = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (!isCanvasVisible) return;

      // 1. Render all active strokes
      strokes.forEach((stroke: CanvasStroke) => {
        if (stroke.targetImageId && targetImageId && stroke.targetImageId !== targetImageId) {
          return;
        }
        if (!stroke.points || stroke.points.length === 0) return;

        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const firstPt = stroke.points[0];
        const startX = firstPt.x * width;
        const startY = firstPt.y * height;

        if (stroke.tool === "pencil" || stroke.tool === "eraser") {
          if (stroke.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
          } else {
            ctx.globalCompositeOperation = "source-over";
          }

          ctx.beginPath();
          ctx.moveTo(startX, startY);

          if (stroke.points.length === 1) {
            ctx.arc(startX, startY, stroke.width / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Smooth Quadratic Curve interpolation
            for (let i = 1; i < stroke.points.length - 1; i++) {
              const p1 = stroke.points[i];
              const p2 = stroke.points[i + 1];
              const xc = ((p1.x + p2.x) / 2) * width;
              const yc = ((p1.y + p2.y) / 2) * height;
              ctx.quadraticCurveTo(p1.x * width, p1.y * height, xc, yc);
            }

            // Connect last point
            const lastPt = stroke.points[stroke.points.length - 1];
            ctx.lineTo(lastPt.x * width, lastPt.y * height);
            ctx.stroke();
          }
        } else if (stroke.tool === "circle" && stroke.points.length > 1) {
          const lastPt = stroke.points[stroke.points.length - 1];
          const endX = lastPt.x * width;
          const endY = lastPt.y * height;
          const radiusX = Math.abs(endX - startX) / 2;
          const radiusY = Math.abs(endY - startY) / 2;
          const centerX = Math.min(startX, endX) + radiusX;
          const centerY = Math.min(startY, endY) + radiusY;

          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (stroke.tool === "rectangle" && stroke.points.length > 1) {
          const lastPt = stroke.points[stroke.points.length - 1];
          const endX = lastPt.x * width;
          const endY = lastPt.y * height;
          const rectW = endX - startX;
          const rectH = endY - startY;

          ctx.beginPath();
          ctx.strokeRect(startX, startY, rectW, rectH);
        }

        ctx.restore();
      });

      // 2. Render Active Laser Pointers
      const now = Date.now();
      let hasActiveLaser = false;
      Object.values(laserPoints).forEach((laser: LaserPoint) => {
        const age = now - laser.timestamp;
        if (age > 1500) return; // Fade out after 1.5 seconds
        hasActiveLaser = true;

        const lx = laser.x * width;
        const ly = laser.y * height;
        const opacity = Math.max(0, 1 - age / 1500);

        ctx.save();
        ctx.globalAlpha = opacity;

        // Glowing outer pulse ring
        const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, 24);
        gradient.addColorStop(0, laser.color);
        gradient.addColorStop(0.4, laser.color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(lx, ly, 24, 0, Math.PI * 2);
        ctx.fill();

        // Solid inner core
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Minta frame animasi berikutnya HANYA jika ada laser pointer aktif yang sedang memudar
      if (hasActiveLaser) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [strokes, laserPoints, isCanvasVisible, targetImageId]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ touchAction: isDrawingMode && canEdit ? "none" : "auto" }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full z-30 transition-opacity duration-150 ${
          isDrawingMode && canEdit ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
        } ${isCanvasVisible ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
