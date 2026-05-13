"use client";

import { useQuery } from "@tanstack/react-query";
import { searchFoods } from "../services/foodService";

export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ["foods", "search", query],
    queryFn: () => searchFoods(query),
    enabled: query.length > 0,
  });
}
