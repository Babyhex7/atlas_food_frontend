"use client";

import type { Point } from "../types/annotation";
import { zoomAdjusted } from "../utils/scaleCoordinates";

type VertexHandleProps = {
  point: Point;
  color: string;
  zoom: number;
  active: boolean;
  onPointerDown: (event: React.PointerEvent<SVGCircleElement>) => void;
  onDoubleClick: (event: React.MouseEvent<SVGCircleElement>) => void;
};

/**
 * Titik polygon yang bisa di-drag.
 *
 * Ukuran radius dan tebal garis dibagi zoom agar handle terasa sama besar
 * di layar pada level zoom mana pun — tanpa itu, handle jadi raksasa saat
 * zoom in dan tak terklik saat zoom out.
 */
export function VertexHandle({
  point,
  color,
  zoom,
  active,
  onPointerDown,
  onDoubleClick,
}: VertexHandleProps) {
  const radius = zoomAdjusted(active ? 7 : 5, zoom);
  const strokeWidth = zoomAdjusted(2, zoom);

  return (
    <circle
      cx={point[0]}
      cy={point[1]}
      r={radius}
      fill={active ? color : "#ffffff"}
      stroke={color}
      strokeWidth={strokeWidth}
      className="cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    />
  );
}
