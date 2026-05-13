import type { Survey } from "../types/survey";

export type SurveyState = {
  selectedSurvey: Survey | null;
  keyword: string;
};

export const initialSurveyState: SurveyState = {
  selectedSurvey: null,
  keyword: "",
};
