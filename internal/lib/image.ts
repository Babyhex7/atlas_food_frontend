/**
 * image.ts — helper untuk resolve URL foto makanan Atlas Makananku
 *
 * Alur storage:
 *   Development : foto disajikan dari backend  → http://localhost:8080/uploads/atlas/MP/MP-01_A.jpg
 *   Production  : foto disajikan dari MinIO     → https://minio.example.com/atlas-food/photos/MP/MP-01_A.jpg
 *
 * Cukup set env:
 *   NEXT_PUBLIC_API_URL          = http://localhost:8080/api/v1   (wajib)
 *   NEXT_PUBLIC_STORAGE_BASE_URL = https://minio.example.com/atlas-food  (opsional, prod)
 *
 * Kalau NEXT_PUBLIC_STORAGE_BASE_URL tidak diset, gambar diambil dari asal API URL
 * (strip /api/v1) sehingga path /uploads/atlas/... otomatis benar di dev.
 */

/** Base URL tempat file gambar disajikan — tanpa trailing slash */
function getStorageBase(): string {
  // Kalau ada override eksplisit (MinIO di prod), pakai itu
  const storageOverride = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
  if (storageOverride) return storageOverride.replace(/\/$/, "");

  // Fallback: strip /api/v1 dari API URL → pakai origin backend langsung
  const apiUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8080/api/v1";
  return apiUrl.replace(/\/api\/v\d+\/?$/, "");
}

/**
 * Resolve image URL dari path yang disimpan di database.
 *
 * Path di DB bisa berupa:
 *   - Absolute URL : "https://cdn.example.com/photo.jpg"  → dikembalikan apa adanya
 *   - Relative path: "/uploads/atlas/MP/MP-01_A.jpg"      → prepend storageBase
 *
 * @param path  Nilai image_url atau thumbnail_url dari API
 * @returns     URL lengkap yang bisa langsung dipakai di <img src> atau Next <Image>
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  // Sudah absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Relative path — prepend storage base
  const base = getStorageBase();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Resolve URL foto porsi berdasarkan kode makanan dan label.
 * Berguna saat kita tahu kode tapi belum fetch detail API.
 *
 * @param catCode  Kode kategori, misal "MP", "LH", "AS"
 * @param foodCode Kode makanan, misal "MP-01", "AS-22"
 * @param label    Label porsi: "A", "B", ... atau "guide"
 * @returns        URL lengkap foto
 */
export function buildPhotoUrl(catCode: string, foodCode: string, label: string): string {
  const filename = label.toLowerCase() === "guide"
    ? `${foodCode}_guide.jpg`
    : `${foodCode}_${label}.jpg`;
  return getImageUrl(`/uploads/atlas/${catCode}/${filename}`);
}

/**
 * Cek apakah suatu food bertipe "guide" berdasarkan photo_type dari API.
 * Backend menyimpan tipe foto sebagai "series" atau "range".
 * Atlas Makananku FINAL.json pakai istilah "Guide" — keduanya bermakna sama:
 *   series = foto terpisah tiap ukuran (A, B, C, ...)
 *   range  = 1 foto memuat semua ukuran (guide image)
 */
export function isGuideType(photoType: string): boolean {
  return photoType === "range";
}

/** Fallback placeholder saat foto tidak tersedia */
export const PHOTO_PLACEHOLDER = "/images/photo-placeholder.svg";
