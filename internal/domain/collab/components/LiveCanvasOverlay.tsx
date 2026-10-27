"use client";

import { useEffect, useRef, useState } from "react";
import { useLiveCanvas } from "../hooks/useLiveCanvas";
import type { CollabSend } from "../hooks/useWebSocket";
import type { CanvasStroke, LaserPoint } from "../types/collab";
import { getScrollContext } from "../lib/scrollContext";

interface LiveCanvasOverlayProps {
  send: CollabSend;
  targetImageId?: string;
  className?: string;
  /**
   * Jika true, canvas mencakup seluruh area konten halaman (viewport)
   * secara dinamis, DENGAN MENGEKSEKUSI/MENGECUALIKAN header/topbar dan footer
   * agar navigasi dan kontrol tetap dapat diakses bebas tanpa terkena coretan.
   */
  isGlobal?: boolean;
}

export function LiveCanvasOverlay({
  send,
  targetImageId,
  className = "",
  isGlobal = false,
}: LiveCanvasOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Batas container aktif (top, left, width, height)
  const [bounds, setBounds] = useState(() => {
    if (typeof window !== "undefined") {
      return { top: 56, left: 0, width: window.innerWidth, height: Math.max(100, window.innerHeight - 56) };
    }
    return { top: 56, left: 0, width: 1280, height: 744 };
  });

  useEffect(() => {
    if (!isGlobal) return;

    const measureBounds = () => {
      const scrollCtx = getScrollContext(containerRef.current, isGlobal);
      const { top, left, width, height } = scrollCtx.containerRect;

      setBounds((prev) => {
        if (
          prev.top === top &&
          prev.left === left &&
          prev.width === width &&
          prev.height === height
        ) {
          return prev;
        }
        return { top, left, width, height };
      });
    };

    measureBounds();
    window.addEventListener("resize", measureBounds, { passive: true });
    window.addEventListener("scroll", measureBounds, { capture: true, passive: true });

    // Pantau perubahan DOM (misal: CollabStatusStrip muncul/hilang di header, atau ganti step wizard)
    const observer = new MutationObserver(measureBounds);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", measureBounds);
      window.removeEventListener("scroll", measureBounds, { capture: true } as any);
      observer.disconnect();
    };
  }, [isGlobal]);

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
  } = useLiveCanvas({ containerRef, send, targetImageId, isGlobal });

  // Main Render Engine (Canvas 2D Context)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas resolution to match container pixel dimensions.
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.round(rect.width * dpr);
      const nextHeight = Math.round(rect.height * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      // setTransform (bukan scale) agar skala DPR tidak menumpuk antar pemanggilan
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
      render();
    });
    resizeObserver.observe(container);
    updateCanvasSize();

    // Render Function dengan Document Scroll Offsets (Option A: nempel di konten saat di-scroll)
    const render = () => {
      const scrollCtx = getScrollContext(container, isGlobal);
      const { scrollLeft, scrollTop, contentWidth, contentHeight, containerRect } = scrollCtx;
      const width = containerRect.width;
      const height = containerRect.height;

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
        const startX = firstPt.x * contentWidth - scrollLeft;
        const startY = firstPt.y * contentHeight - scrollTop;

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
              const x1 = p1.x * contentWidth - scrollLeft;
              const y1 = p1.y * contentHeight - scrollTop;
              const x2 = p2.x * contentWidth - scrollLeft;
              const y2 = p2.y * contentHeight - scrollTop;
              const xc = (x1 + x2) / 2;
              const yc = (y1 + y2) / 2;
              ctx.quadraticCurveTo(x1, y1, xc, yc);
            }

            // Connect last point
            const lastPt = stroke.points[stroke.points.length - 1];
            ctx.lineTo(lastPt.x * contentWidth - scrollLeft, lastPt.y * contentHeight - scrollTop);
            ctx.stroke();
          }
        } else if (stroke.tool === "circle" && stroke.points.length > 1) {
          const lastPt = stroke.points[stroke.points.length - 1];
          const endX = lastPt.x * contentWidth - scrollLeft;
          const endY = lastPt.y * contentHeight - scrollTop;
          const radiusX = Math.abs(endX - startX) / 2;
          const radiusY = Math.abs(endY - startY) / 2;
          const centerX = Math.min(startX, endX) + radiusX;
          const centerY = Math.min(startY, endY) + radiusY;

          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (stroke.tool === "rectangle" && stroke.points.length > 1) {
          const lastPt = stroke.points[stroke.points.length - 1];
          const endX = lastPt.x * contentWidth - scrollLeft;
          const endY = lastPt.y * contentHeight - scrollTop;
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
        if (age > 1500) return; // Fade out after 1.5 detik
        hasActiveLaser = true;

        const lx = laser.x * contentWidth - scrollLeft;
        const ly = laser.y * contentHeight - scrollTop;
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

    // Listen to scroll events globally using capture: true so any container scroll triggers a redraw
    const onScroll = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("scroll", onScroll, { capture: true, passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll, { capture: true } as any);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [strokes, laserPoints, isCanvasVisible, targetImageId, isGlobal]);

  return (
    <div
      ref={containerRef}
      className={`${
        isGlobal
          ? "fixed z-40 overflow-hidden"
          : `absolute inset-0 w-full h-full ${className}`
      } ${
        isDrawingMode && canEdit ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        ...(isGlobal && bounds.width > 0
          ? {
              top: `${bounds.top}px`,
              left: `${bounds.left}px`,
              width: `${bounds.width}px`,
              height: `${bounds.height}px`,
            }
          : {}),
        touchAction: isDrawingMode && canEdit ? "none" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="live-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute inset-0 w-full h-full ${
          isGlobal ? "z-40" : "z-30"
        } transition-opacity duration-150 ${
          isDrawingMode && canEdit ? "cursor-crosshair pointer-events-auto" : "pointer-events-none"
        } ${isCanvasVisible ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
