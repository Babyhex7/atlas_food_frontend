export type Category = {
  id: string;
  code: string;
  name: string;
  icon?: string | null;
  display_order: number;
};

export type CreateCategoryRequest = {
  code: string;
  name: string;
  icon?: string;
  display_order?: number;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
