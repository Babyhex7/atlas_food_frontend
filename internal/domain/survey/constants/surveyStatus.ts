export const surveyStatuses = {
  draft: "draft",
  active: "active",
  closed: "closed",
} as const;

export type SurveyStatus = (typeof surveyStatuses)[keyof typeof surveyStatuses];
