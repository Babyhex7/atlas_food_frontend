import { EmptyState } from "@/internal/pkg/components/EmptyState";
import type { Category } from "../types/category";

export function CategoryList({ categories = [] }: { categories?: Category[] }) {
  if (categories.length === 0) return <EmptyState title="No categories" />;

  return <ul>{categories.map((category) => <li key={category.id}>{category.icon} {category.name}</li>)}</ul>;
}
