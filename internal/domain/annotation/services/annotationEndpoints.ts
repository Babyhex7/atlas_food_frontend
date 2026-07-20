/**
 * Path API domain annotation.
 *
 * Dipisah dari annotationService agar path bisa dipakai sebagai query key
 * tanpa mengimpor seluruh service.
 */
export const annotationEndpoints = {
  admin: {
    list: "/admin/food-images",
    detail: (id: string) => `/admin/food-images/${id}`,
    areas: (id: string) => `/admin/food-images/${id}/areas`,
    publish: (id: string) => `/admin/food-images/${id}/publish`,
    unpublish: (id: string) => `/admin/food-images/${id}/unpublish`,
    export: (id: string) => `/admin/food-images/${id}/export`,
  },
  public: {
    list: "/public/food-images",
    detail: (id: string) => `/public/food-images/${id}`,
    byFood: (foodId: string) => `/public/foods/${foodId}/images`,
  },
  upload: "/upload",
} as const;
