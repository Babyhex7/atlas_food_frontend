import type { SurveyStatus } from "../constants/surveyStatus";

export type MealConfig = {
  name: string;
  time: string;
  order: number;
};

export type SurveyPrompts = Record<string, string>;

export type Survey = {
  id: string;
  slug: string;
  name: string;
  description: string;
  meals_config: MealConfig[];
  prompts?: SurveyPrompts;
  locale_id: number;
  start_date?: string | null;
  end_date?: string | null;
  status: SurveyStatus;
  access_token: string;
  created_by: string;
  created_at: string;
};

export type SurveyParticipant = {
  id: string;
  survey_id: string;
  user_id?: string | null;
  alias?: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export type Locale = {
  id: number;
  code: string;
  name: string;
};

export type CreateSurveyRequest = {
  slug?: string;
  name: string;
  description?: string;
  meals_config: MealConfig[];
  prompts?: SurveyPrompts;
  locale_id?: number;
  start_date?: string;
  end_date?: string;
  status?: SurveyStatus;
};

export type UpdateSurveyRequest = {
  name?: string;
  description?: string;
  meals_config?: MealConfig[];
  prompts?: SurveyPrompts;
  locale_id?: number;
  start_date?: string;
  end_date?: string;
  status?: SurveyStatus;
};

export type JoinSurveyResponse = {
  message: string;
  survey: Survey;
};
