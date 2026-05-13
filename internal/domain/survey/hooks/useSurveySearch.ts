import { useMemo } from "react";
import { useDebounce } from "@/internal/pkg/hooks/useDebounce";
import type { Survey } from "../types/survey";

export function useSurveySearch(surveys: Survey[], keyword: string) {
  const debouncedKeyword = useDebounce(keyword);

  return useMemo(() => {
    return surveys.filter((survey) => survey.name.toLowerCase().includes(debouncedKeyword.toLowerCase()));
  }, [surveys, debouncedKeyword]);
}
