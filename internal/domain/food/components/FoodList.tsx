import { EmptyState } from "@/internal/pkg/components/EmptyState";
import type { Food } from "../types/food";

export function FoodList({ foods = [] }: { foods?: Food[] }) {
  if (foods.length === 0) return <EmptyState title="No foods" />;

  return <ul>{foods.map((food) => <li key={food.id}>{food.name}</li>)}</ul>;
}
