"use client";

import { useCallback, useState } from "react";
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from "../constants/annotationStatus";
import { clamp } from "../utils/polygonMath";

export type CanvasTransform = {
  zoom: number;
  panX: number;
  panY: number;
};

/**
 * Zoom & pan kanvas editor.
 *
 * Transform diterapkan pada <g> SVG sebagai `translate(panX panY) scale(zoom)`.
 * Nilai pan berada dalam satuan pixel gambar, sehingga urutan translate-lalu-scale
 * harus dipertahankan di komponen agar hitungan di sini tetap valid.
 */
export function useCanvasTransform() {
  const [transform, setTransform] = useState<CanvasTransform>({ zoom: 1, panX: 0, panY: 0 });

  const zoomTo = useCallback((zoom: number) => {
    setTransform((current) => ({ ...current, zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) }));
  }, []);

  const zoomIn = useCallback(() => {
    setTransform((current) => ({
      ...current,
      zoom: clamp(current.zoom * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((current) => ({
      ...current,
      zoom: clamp(current.zoom / ZOOM_STEP, MIN_ZOOM, MAX_ZOOM),
    }));
  }, []);

  const reset = useCallback(() => setTransform({ zoom: 1, panX: 0, panY: 0 }), []);

  const panBy = useCallback((deltaX: number, deltaY: number) => {
    setTransform((current) => ({
      ...current,
      panX: current.panX + deltaX,
      panY: current.panY + deltaY,
    }));
  }, []);

  /**
   * Zoom yang berpusat pada satu titik gambar (mis. posisi kursor).
   * Menyesuaikan pan agar titik tersebut tetap diam di layar saat skala berubah.
   */
  const zoomAtPoint = useCallback((factor: number, imageX: number, imageY: number) => {
    setTransform((current) => {
      const nextZoom = clamp(current.zoom * factor, MIN_ZOOM, MAX_ZOOM);

      // Tidak berubah karena sudah mentok — jangan geser pan
      if (nextZoom === current.zoom) return current;

      return {
        zoom: nextZoom,
        panX: current.panX + imageX * (current.zoom - nextZoom),
        panY: current.panY + imageY * (current.zoom - nextZoom),
      };
    });
  }, []);

  return { transform, zoomIn, zoomOut, zoomTo, zoomAtPoint, panBy, reset };
}
