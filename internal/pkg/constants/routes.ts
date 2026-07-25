export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  profile: "/profile",
  surveys: "/surveys",
  adminSurveys: "/admin/surveys",
  newAdminSurvey: "/admin/surveys/new",
  adminSurveyDetail: (id: string) => `/admin/surveys/${id}`,
  /** Sesi recall setelah join dari hub /surveys */
  recallSurvey: (accessToken: string) => `/surveys/${accessToken}/recall`,
} as const;
