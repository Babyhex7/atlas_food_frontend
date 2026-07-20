"use client";

import type { DraftArea, Point } from "../types/annotation";
import { areaColor } from "../constants/annotationStatus";
import { polygonCentroid, toSvgPoints } from "../utils/polygonMath";
import { zoomAdjusted } from "../utils/scaleCoordinates";
import { VertexHandle } from "./VertexHandle";

type PolygonLayerProps = {
  areas: DraftArea[];
  drawingPolygon: Point[];
  selectedLocalId: string | null;
  zoom: number;
  editable: boolean;
  /** Mode gambar: polygon dibuat tembus klik agar tidak menghalangi titik baru */
  drawing: boolean;
  onSelectArea: (localId: string) => void;
  onVertexPointerDown: (localId: string, index: number, event: React.PointerEvent) => void;
  onVertexDoubleClick: (localId: string, index: number) => void;
};

/**
 * Menggambar seluruh polygon di atas gambar.
 *
 * Hanya render + event; tidak ada perhitungan koordinat maupun mutasi state.
 */
export function PolygonLayer({
  areas,
  drawingPolygon,
  selectedLocalId,
  zoom,
  editable,
  drawing,
  onSelectArea,
  onVertexPointerDown,
  onVertexDoubleClick,
}: PolygonLayerProps) {
  return (
    <>
      {areas.map((area, index) => {
        const color = areaColor(index);
        const selected = area.localId === selectedLocalId;
        const centroid = polygonCentroid(area.polygon);

        return (
          <g key={area.localId}>
            <polygon
              points={toSvgPoints(area.polygon)}
              fill={color}
              fillOpacity={selected ? 0.35 : 0.18}
              stroke={color}
              strokeWidth={zoomAdjusted(selected ? 3 : 2, zoom)}
              strokeLinejoin="round"
              // Saat menggambar, polygon lama harus tembus klik. Tanpa ini,
              // area baru yang menimpa area lama mustahil digambar karena
              // setiap klik tertangkap polygon di bawahnya.
              pointerEvents={drawing ? "none" : "auto"}
              className={drawing ? undefined : "cursor-pointer"}
              onPointerDown={(event) => {
                // Cegah klik ini merambat ke kanvas dan membatalkan seleksi
                event.stopPropagation();
                onSelectArea(area.localId);
              }}
            />

            {centroid && (
              <text
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={zoomAdjusted(14, zoom)}
                fill="#ffffff"
                stroke="#00000088"
                strokeWidth={zoomAdjusted(3, zoom)}
                paintOrder="stroke"
                className="pointer-events-none select-none font-semibold"
              >
                {area.name}
              </text>
            )}

            {editable &&
              selected &&
              area.polygon.map((point, vertexIndex) => (
                <VertexHandle
                  key={`${area.localId}-${vertexIndex}`}
                  point={point}
                  color={color}
                  zoom={zoom}
                  active
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onVertexPointerDown(area.localId, vertexIndex, event);
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onVertexDoubleClick(area.localId, vertexIndex);
                  }}
                />
              ))}
          </g>
        );
      })}

      {/* Polygon yang sedang digambar — garis putus-putus agar jelas belum jadi */}
      {drawingPolygon.length > 0 && (
        <g className="pointer-events-none">
          <polyline
            points={toSvgPoints(drawingPolygon)}
            fill="none"
            stroke="#111827"
            strokeWidth={zoomAdjusted(2, zoom)}
            strokeDasharray={`${zoomAdjusted(6, zoom)} ${zoomAdjusted(4, zoom)}`}
          />
          {drawingPolygon.map((point, index) => (
            <circle
              key={`draw-${index}`}
              cx={point[0]}
              cy={point[1]}
              r={zoomAdjusted(4, zoom)}
              fill="#ffffff"
              stroke="#111827"
              strokeWidth={zoomAdjusted(2, zoom)}
            />
          ))}
        </g>
      )}
    </>
  );
}
