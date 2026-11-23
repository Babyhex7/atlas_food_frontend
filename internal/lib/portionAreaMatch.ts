// Pencocokan antara foto porsi (A/B/C/...) dan area anotasi polygon di foto.
//
// Mengapa dipisah: sebelumnya pencocokan memakai "label ATAU berat" dan mengambil kecocokan
// pertama. Untuk ikan potongan seperti Patin (kepala 59g, badan 84g, ekor 59g) berat kepala dan
// ekor sama, sehingga memilih porsi C (ekor) malah menyorot area A (kepala). Di sini label
// (mis. "Porsi C") selalu diprioritaskan, dan berat hanya dipakai sebagai cadangan.

interface AreaLike {
  id?: string;
  name: string;
  weight_gram?: number | null;
}

interface PhotoLike {
  label: string;
  weight_gram?: number | null;
}

// Selisih berat (gram) yang dianggap sama
const WEIGHT_TOLERANCE = 0.5;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Apakah nama area menyebut label porsi ini (mis. "Ikan Patin Porsi C (59g - Bagian Ekor)" -> "C")
export function areaMatchesLabel(area: AreaLike, photo: PhotoLike): boolean {
  if (!photo.label || !area.name) return false;
  const re = new RegExp(`(^|\\s|PORSI\\s*)${escapeRegex(photo.label)}(\\s|\\.|$)`, "i");
  return re.test(area.name.toUpperCase());
}

function sameWeight(area: AreaLike, photo: PhotoLike): boolean {
  if (!area.weight_gram || !photo.weight_gram) return false;
  return Math.abs(area.weight_gram - photo.weight_gram) < WEIGHT_TOLERANCE;
}

// Cari area yang cocok untuk satu foto porsi: label dulu, baru berat
export function findAreaForPhoto<A extends AreaLike>(areas: A[], photo: PhotoLike | null | undefined): A | undefined {
  if (!photo) return undefined;
  return areas.find((a) => areaMatchesLabel(a, photo)) ?? areas.find((a) => sameWeight(a, photo));
}

// Cari indeks foto porsi yang cocok untuk satu area: label dulu, baru berat
export function findPhotoIndexForArea<P extends PhotoLike>(photos: P[], area: AreaLike): number {
  const byLabel = photos.findIndex((p) => areaMatchesLabel(area, p));
  if (byLabel !== -1) return byLabel;
  return photos.findIndex((p) => sameWeight(area, p));
}
