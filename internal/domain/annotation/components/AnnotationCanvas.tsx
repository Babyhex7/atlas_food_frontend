"use client";

import { useCallback, useRef } from "react";
import { API_ASSET_ORIGIN } from "@/internal/pkg/api";
import type { DraftArea, Point } from "../types/annotation";
import { clientPointToImagePoint } from "../utils/scaleCoordinates";
import { PolygonLayer } from "./PolygonLayer";
import type { CanvasTransform } from "../hooks/useCanvasTransform";

type AnnotationCanvasProps = {
  imageUrl: string;
  width: number;
  height: number;
  areas: DraftArea[];
  drawingPolygon: Point[];
  selectedLocalId: string | null;
  transform: CanvasTransform;
  editable: boolean;
  drawing: boolean;
  onCanvasClick: (point: Point) => void;
  onSelectArea: (localId: string) => void;
  onVertexDragStart: (localId: string, index: number) => void;
  onVertexDrag: (point: Point) => void;
  onVertexDragEnd: () => void;
  onVertexDoubleClick: (localId: string, index: number) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoomAtPoint: (factor: number, imageX: number, imageY: number) => void;
  isDragging: boolean;
};

/**
 * Kanvas anotasi: <image> dengan overlay SVG polygon.
 *
 * Tanggung jawabnya hanya render + menerjemahkan pointer event menjadi
 * koordinat pixel gambar. Semua keputusan (titik masuk ke polygon mana,
 * apa yang terhapus) ada di store lewat callback.
 */
export function AnnotationCanvas({
  imageUrl,
  width,
  height,
  areas,
  drawingPolygon,
  selectedLocalId,
  transform,
  editable,
  drawing,
  onCanvasClick,
  onSelectArea,
  onVertexDragStart,
  onVertexDrag,
  onVertexDragEnd,
  onVertexDoubleClick,
  onPan,
  onZoomAtPoint,
  isDragging,
}: AnnotationCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const panStateRef = useRef<{ clientX: number; clientY: number } | null>(null);

  /** Terjemahkan posisi pointer layar ke pixel gambar asli */
  const toImagePoint = useCallback((clientX: number, clientY: number): Point | null => {
    if (!svgRef.current || !groupRef.current) return null;
    return clientPointToImagePoint(svgRef.current, groupRef.current, clientX, clientY);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      // Tombol tengah atau spasi+drag → geser kanvas, bukan menggambar
      if (event.button === 1 || event.shiftKey) {
        event.preventDefault();
        panStateRef.current = { clientX: event.clientX, clientY: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      if (event.button !== 0) return;

      const point = toImagePoint(event.clientX, event.clientY);
      if (point) onCanvasClick(point);
    },
    [toImagePoint, onCanvasClick]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (panStateRef.current) {
        const deltaX = event.clientX - panStateRef.current.clientX;
        const deltaY = event.clientY - panStateRef.current.clientY;
        panStateRef.current = { clientX: event.clientX, clientY: event.clientY };

        // Delta pointer dalam pixel layar, sedangkan panX/panY hidup di satuan
        // viewBox. Bagi dengan skala CTM root agar geseran mengikuti kursor
        // persis, berapa pun ukuran render SVG-nya.
        const rootCtm = svgRef.current?.getScreenCTM();
        const scale = rootCtm && rootCtm.a !== 0 ? rootCtm.a : 1;

        onPan(deltaX / scale, deltaY / scale);
        return;
      }

      if (!isDragging) return;

      const point = toImagePoint(event.clientX, event.clientY);
      if (point) onVertexDrag(point);
    },
    [isDragging, onPan, onVertexDrag, toImagePoint]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (panStateRef.current) {
        panStateRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        return;
      }

      if (isDragging) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        onVertexDragEnd();
      }
    },
    [isDragging, onVertexDragEnd]
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      // Hanya zoom saat Ctrl/Cmd ditahan, supaya scroll halaman tetap normal
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      const point = toImagePoint(event.clientX, event.clientY);
      if (!point) return;

      onZoomAtPoint(event.deltaY < 0 ? 1.1 : 1 / 1.1, point[0], point[1]);
    },
    [onZoomAtPoint, toImagePoint]
  );

  const src = imageUrl.startsWith("http") ? imageUrl : `${API_ASSET_ORIGIN}${imageUrl}`;

  return (
    <div className="relative w-full overflow-hidden rounded-md border border-border bg-surface-alt">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-auto touch-none select-none"
        style={{ cursor: editable ? "crosshair" : "default" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        // pointerleave sengaja tidak mengakhiri drag: selama pointer captured,
        // kursor boleh keluar kotak SVG dan drag harus tetap berjalan.
        // Pengakhiran ditangani pointerup / pointercancel.
        onWheel={handleWheel}
      >
        {/* Urutan transform harus translate lalu scale — useCanvasTransform
            menghitung pan dalam satuan pixel gambar dengan asumsi ini. */}
        <g ref={groupRef} transform={`translate(${transform.panX} ${transform.panY}) scale(${transform.zoom})`}>
          <image href={src} x={0} y={0} width={width} height={height} />

          <PolygonLayer
            areas={areas}
            drawingPolygon={drawingPolygon}
            selectedLocalId={selectedLocalId}
            zoom={transform.zoom}
            editable={editable}
            drawing={drawing}
            onSelectArea={onSelectArea}
            onVertexPointerDown={(localId, index, event) => {
              // Kunci pointer ke SVG selama drag. Tanpa ini, gerakan cepat
              // yang keluar dari kotak SVG memicu pointerleave dan drag
              // terputus di tengah jalan.
              svgRef.current?.setPointerCapture(event.pointerId);
              onVertexDragStart(localId, index);
            }}
            onVertexDoubleClick={onVertexDoubleClick}
          />
        </g>
      </svg>
    </div>
  );
}
