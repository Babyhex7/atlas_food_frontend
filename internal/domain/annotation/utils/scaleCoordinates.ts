import type { Point } from "../types/annotation";

/**
 * Konversi koordinat pointer layar ke pixel space gambar asli.
 *
 * Sengaja memakai matriks CTM milik SVG, bukan hitungan manual dari
 * getBoundingClientRect + faktor zoom. CTM sudah memperhitungkan viewBox,
 * `preserveAspectRatio`, transform zoom/pan pada <g>, dan scroll halaman
 * sekaligus — menghitungnya sendiri berarti menduplikasi logika browser
 * dan itulah sumber klasik polygon "meleset" saat di-zoom.
 */
export function clientPointToImagePoint(
  svg: SVGSVGElement,
  target: SVGGraphicsElement,
  clientX: number,
  clientY: number
): Point | null {
  const ctm = target.getScreenCTM();

  // CTM null bila elemen belum ter-render (display:none / belum layout)
  if (!ctm) return null;

  const svgPoint = svg.createSVGPoint();
  svgPoint.x = clientX;
  svgPoint.y = clientY;

  const transformed = svgPoint.matrixTransform(ctm.inverse());
  return [transformed.x, transformed.y];
}

/**
 * Panjang dalam pixel layar → panjang dalam pixel gambar.
 * Dipakai agar radius klik vertex terasa sama besar di semua level zoom.
 */
export function screenLengthToImageLength(length: number, zoom: number): number {
  if (zoom <= 0) return length;
  return length / zoom;
}

/**
 * Ukuran stroke/handle yang dikompensasi zoom.
 * Tanpa ini, garis polygon menebal saat zoom in dan hilang saat zoom out.
 */
export function zoomAdjusted(value: number, zoom: number): number {
  if (zoom <= 0) return value;
  return value / zoom;
}
