// Konstanta bersama Landing. Sengaja di luar file "use client" agar bisa
// dibaca langsung oleh server component.

// Semua gambar Landing adalah aset ekspor Figma di public/images/landing.
export const LANDING_ASSETS = {
  logoBrin: "/images/landing/logo-brin.png",
  logoUpi: "/images/landing/logo-upi.png",
  logoAtlas: "/images/landing/atlas-food-logo.png",
  foodGrid: "/images/landing/food-grid.png",
  whyDeveloped: "/images/landing/why-developed.png",
  visualReference: "/images/landing/visual-reference.png",
  referenceSeries: "/images/landing/reference-series.png",
  referenceRange: "/images/landing/reference-range.png",
  referenceGuide: "/images/landing/reference-guide.png",
  utensilsCatalog: "/images/landing/utensils-catalog.png",
  categoryFeatured: "/images/landing/category-featured.png",
  ctaCollage: "/images/landing/cta-collage.png",
  categoriesHero: "/images/landing/kategori-hero.png",
  categoriesCta: "/images/landing/kategori-cta.png",
  atlasCover: "/images/landing/atlas-makananku-cover.png",
  flowOpenAtlas: "/images/landing/metodologi-buka-atlas.png",
  flowComparePhoto: "/images/landing/metodologi-bandingkan-foto.png",
  methodologyQuote: "/images/landing/metodologi-kutipan.png",
  teamHero: "/images/landing/tim-hero.png",
} as const;

/** Foto sampul per kategori: public/images/landing/kategori/<KODE>.png */
export function categoryCoverImage(code: string): string {
  return `/images/landing/kategori/${code}.png`;
}

/** Foto anggota tim: public/images/landing/tim/<nama-anggota>.png */
export function teamPhoto(slug: string): string {
  return `/images/landing/tim/${slug}.png`;
}

export const LANDING_NAVIGATION = [
  { href: "/", label: "Beranda" },
  { href: "/kategori", label: "Kategori" },
  { href: "/metodologi", label: "Metodologi" },
  { href: "/tim-peneliti", label: "Tim Peneliti" },
];

// Backend belum menyimpan deskripsi kategori, jadi ringkasannya dipetakan per kode.
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  MP: "Nasi, Umbi, dan Sumber Karbohidrat",
  LH: "Daging, Ikan, Unggas, dan Telur",
  LN: "Tahu, Tempe, dan Kacang-kacangan",
  SR: "Segar, Tumis, dan Berkuah",
  AS: "Segar, Tumis, dan Berkuah",
  BH: "Segar dan Potong Terstandar",
  AB: "Segar dan Potong Terstandar",
  AP: "Roti, Kue, dan Kudapan",
  AMK: "Makanan dan Minuman Kemasan",
  KK: "Keripik dan Camilan",
  ABK: "Bumbu dan Pelengkap Masakan",
  AK: "Makanan Siap Saji",
  MDL: "Minyak dan Lemak",
  GK: "Gula dan Pemanis",
};

export const CATEGORY_DESCRIPTION_FALLBACK = "Koleksi bahan pangan Indonesia.";
