export const portionMethodTypes = {
  asServed: "as_served",
  guideImage: "guide_image",
  weight: "weight",
} as const;

/** Label bahasa Indonesia untuk ditampilkan di panel admin */
export const PORTION_METHOD_TYPES = [
  { value: portionMethodTypes.asServed, label: "Foto porsi (as served)" },
  { value: portionMethodTypes.guideImage, label: "Gambar panduan" },
  { value: portionMethodTypes.weight, label: "Berat manual" },
] as const;

export const portionSelectionTypes = {
  simpleGrid: "simple_grid",
  asServedQuantity: "as_served_quantity",
  counter: "counter",
  input: "input",
} as const;
