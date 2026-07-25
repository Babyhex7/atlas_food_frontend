/**
 * Kontrak data Food Annotation CMS.
 *
 * Koordinat polygon SELALU dalam pixel space gambar asli (lihat `width`/`height`
 * pada FoodImage). Konversi ke koordinat layar dilakukan di utils/scaleCoordinates.
 */

export type AnnotationStatus = "draft" | "published" | "archived";

/** Satu titik polygon: [x, y] dalam pixel gambar asli */
export type Point = [number, number];

/** Satu region yang bisa diklik di dalam sebuah gambar */
export type FoodArea = {
  id: string;
  food_image_id: string;
  name: string;
  food_id: string | null;
  polygon: Point[];
  z_index: number;
  created_at: string;
  updated_at: string;
};

/** Gambar scene beserta seluruh area anotasinya */
export type FoodImage = {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  status: AnnotationStatus;
  primary_food_id: string | null;
  created_by: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  areas: FoodArea[];
};

/** Bentuk ringkas untuk tabel list — tanpa polygon */
export type FoodImageSummary = {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  status: AnnotationStatus;
  primary_food_id?: string | null;
  areas_count: number;
  published_at: string | null;
  updated_at: string;
};

export type FoodImageListResponse = {
  items: FoodImageSummary[];
  total: number;
  page: number;
  limit: number;
};

export type CreateFoodImageRequest = {
  title: string;
  image_url: string;
  thumbnail_url?: string;
  width: number;
  height: number;
  primary_food_id?: string | null;
};

export type UpdateFoodImageRequest = {
  title?: string;
  thumbnail_url?: string;
  primary_food_id?: string | null;
};

/**
 * Area dalam payload replace-all.
 * `id` opsional: area yang baru digambar belum punya id dari server.
 */
export type AreaInput = {
  id?: string;
  name: string;
  food_id?: string | null;
  polygon: Point[];
  z_index: number;
};

export type ReplaceAreasRequest = {
  areas: AreaInput[];
};

export type ReplaceAreasResponse = {
  food_image_id: string;
  status: AnnotationStatus;
  areas_count: number;
  updated_at: string;
};

export type UploadResponse = {
  url: string;
  filename: string;
  size: number;
  uploaded_at: string;
};

/** Area sebagaimana dipegang editor sebelum tersimpan ke server */
export type DraftArea = {
  /** id lokal stabil selama sesi editor; id server disimpan terpisah */
  localId: string;
  serverId?: string;
  name: string;
  foodId: string | null;
  polygon: Point[];
  zIndex: number;
};

export type EditorMode = "draw" | "edit";

export type AutosaveState = "idle" | "pending" | "saving" | "saved" | "error";
