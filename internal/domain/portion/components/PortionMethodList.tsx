import { EmptyState } from "@/internal/pkg/components/EmptyState";
import type { FoodPortionSizeMethod } from "../types/portion";

export function PortionMethodList({ methods = [] }: { methods?: FoodPortionSizeMethod[] }) {
  if (methods.length === 0) return <EmptyState title="No portion methods" />;

  return <ul>{methods.map((method) => <li key={method.id}>{method.label}</li>)}</ul>;
}
