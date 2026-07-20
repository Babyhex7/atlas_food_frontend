import type { Point } from "../types/annotation";

/**
 * Fungsi geometri murni untuk editor polygon.
 * Semua koordinat dalam pixel space gambar asli — tidak ada urusan DOM di sini.
 */

/** Jepit nilai ke rentang [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Jepit sebuah titik ke dalam batas gambar */
export function clampPoint(point: Point, width: number, height: number): Point {
  return [clamp(point[0], 0, width), clamp(point[1], 0, height)];
}

/** Jarak kuadrat antar titik — hindari sqrt saat hanya membandingkan */
export function distanceSquared(a: Point, b: Point): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt(distanceSquared(a, b));
}

/**
 * Cari indeks vertex terdekat dari sebuah titik, dalam radius tertentu.
 * Mengembalikan -1 bila tidak ada yang cukup dekat.
 */
export function findNearestVertex(polygon: Point[], target: Point, radius: number): number {
  const radiusSquared = radius * radius;
  let best = -1;
  let bestDistance = Infinity;

  for (let i = 0; i < polygon.length; i += 1) {
    const d = distanceSquared(polygon[i], target);
    if (d <= radiusSquared && d < bestDistance) {
      best = i;
      bestDistance = d;
    }
  }

  return best;
}

/**
 * Uji apakah sebuah titik berada di dalam polygon (ray casting).
 *
 * Perbandingan `(yi > y) !== (yj > y)` sengaja memakai strict inequality
 * agar titik yang persis sejajar dengan vertex tidak terhitung dua kali.
 */
export function isPointInPolygon(polygon: Point[], point: Point): boolean {
  if (polygon.length < 3) return false;

  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

/** Bounding box polygon; null bila polygon kosong */
export function polygonBounds(
  polygon: Point[]
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (polygon.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of polygon) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
}

/** Titik tengah bounding box — dipakai menempatkan label area */
export function polygonCentroid(polygon: Point[]): Point | null {
  const bounds = polygonBounds(polygon);
  if (!bounds) return null;
  return [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
}

/** Serialisasi ke atribut `points` milik <polygon> SVG */
export function toSvgPoints(polygon: Point[]): string {
  return polygon.map(([x, y]) => `${x},${y}`).join(" ");
}

/**
 * Cari indeks sisi terdekat dari sebuah titik.
 * Dipakai untuk menyisipkan vertex baru di tengah sisi yang diklik.
 * Mengembalikan indeks sisipan (posisi vertex baru), atau -1.
 */
export function findNearestEdge(polygon: Point[], target: Point, maxDistance: number): number {
  if (polygon.length < 2) return -1;

  let best = -1;
  let bestDistance = maxDistance;

  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const d = pointToSegmentDistance(target, a, b);

    if (d < bestDistance) {
      best = i + 1;
      bestDistance = d;
    }
  }

  return best;
}

/** Jarak titik ke ruas garis AB */
export function pointToSegmentDistance(point: Point, a: Point, b: Point): number {
  const lengthSquared = distanceSquared(a, b);

  // A dan B berimpit — jaraknya jadi jarak ke titik itu sendiri
  if (lengthSquared === 0) return distance(point, a);

  // Proyeksikan point ke AB, lalu jepit ke ruas (bukan garis tak hingga)
  const t = clamp(
    ((point[0] - a[0]) * (b[0] - a[0]) + (point[1] - a[1]) * (b[1] - a[1])) / lengthSquared,
    0,
    1
  );

  const projection: Point = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  return distance(point, projection);
}
